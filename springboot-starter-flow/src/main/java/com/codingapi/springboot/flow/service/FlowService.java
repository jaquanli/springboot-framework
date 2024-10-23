package com.codingapi.springboot.flow.service;

import com.codingapi.springboot.flow.bind.BindDataSnapshot;
import com.codingapi.springboot.flow.bind.IBindData;
import com.codingapi.springboot.flow.domain.FlowNode;
import com.codingapi.springboot.flow.domain.FlowWork;
import com.codingapi.springboot.flow.domain.Opinion;
import com.codingapi.springboot.flow.record.FlowRecord;
import com.codingapi.springboot.flow.repository.FlowBindDataRepository;
import com.codingapi.springboot.flow.repository.FlowOperatorRepository;
import com.codingapi.springboot.flow.repository.FlowRecordRepository;
import com.codingapi.springboot.flow.repository.FlowWorkRepository;
import com.codingapi.springboot.flow.user.IFlowOperator;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
public class FlowService {

    private final FlowWorkRepository flowWorkRepository;
    private final FlowRecordRepository flowRecordRepository;
    private final FlowBindDataRepository flowBindDataRepository;
    private final FlowOperatorRepository flowOperatorRepository;

    /**
     * 发起流程
     *
     * @param workId   流程id
     * @param operator 操作者
     * @param bindData 绑定数据
     * @param advice   审批意见
     */
    public void startFlow(long workId, IFlowOperator operator, IBindData bindData, String advice) {
        // 检测流程是否存在
        FlowWork flowWork = flowWorkRepository.getFlowWorkById(workId);
        if (flowWork == null) {
            throw new IllegalArgumentException("flow work not found");
        }
        flowWork.enableValidate();
        flowWork.lockValidate();

        // 保存绑定数据
        BindDataSnapshot snapshot = new BindDataSnapshot(bindData);
        flowBindDataRepository.save(snapshot);
        String processId = flowWork.generateProcessId();

        Opinion opinion = Opinion.success(advice);

        FlowRecordService flowRecordService = new FlowRecordService(flowOperatorRepository, processId, operator, operator, snapshot, opinion, flowWork, opinion.isSuccess(), new ArrayList<>());
        // 获取开始节点
        FlowNode start = flowWork.getStartNode();
        if (start == null) {
            throw new IllegalArgumentException("start node not found");
        }
        long preId = 0;

        // 创建待办记录
        List<FlowRecord> records = flowRecordService.createRecord(preId, start);
        flowRecordRepository.save(records);

        // 提交流程
        if (!records.isEmpty()) {
            for (FlowRecord record : records) {
                this.submitFlow(record.getId(), operator, bindData, opinion);
            }
        }
    }


    /**
     * 提交流程
     *
     * @param recordId        流程记录id
     * @param currentOperator 当前操作者
     * @param bindData        绑定数据
     * @param opinion         审批意见
     */
    public void submitFlow(long recordId, IFlowOperator currentOperator, IBindData bindData, Opinion opinion) {
        // 检测流程记录
        FlowRecord flowRecord = flowRecordRepository.getFlowRecordById(recordId);
        if (flowRecord == null) {
            throw new IllegalArgumentException("flow record not found");
        }
        flowRecord.submitStateVerify();

        // 检测流程
        FlowWork flowWork = flowWorkRepository.getFlowWorkById(flowRecord.getWorkId());
        if (flowWork == null) {
            throw new IllegalArgumentException("flow work not found");
        }
        flowWork.enableValidate();

        // 检测流程节点
        FlowNode flowNode = flowWork.getNodeByCode(flowRecord.getNodeCode());
        if (flowNode == null) {
            throw new IllegalArgumentException("flow node not found");
        }

        // 下一流程的流程记录
        List<FlowRecord> childrenRecords = flowRecordRepository.findFlowRecordByPreId(recordId);
        if (flowNode.isUnSign()) {
            // 如果是非会签，则不能存在后续的子流程
            if (!childrenRecords.isEmpty()) {
                throw new IllegalArgumentException("flow node is done");
            }
        }

        // 获取创建者
        IFlowOperator createOperator = flowOperatorRepository.getFlowOperatorById(flowRecord.getCreateOperatorId());

        // 保存绑定数据
        BindDataSnapshot snapshot = new BindDataSnapshot(bindData);
        flowBindDataRepository.save(snapshot);

        // 根据审批意见判断流程是否进入下一节点
        boolean flowNextStep = opinion.isSuccess();

        // 提交流程
        flowRecord.done(currentOperator, snapshot, opinion);
        flowRecordRepository.update(flowRecord);

        // 当前节点的办理记录
        List<FlowRecord> historyRecords = new ArrayList<>();

        // 与当前流程同级的流程记录
        List<FlowRecord> currentFlowRecords = flowRecordRepository.findFlowRecordByPreId(flowRecord.getPreId());

        // 会签处理流程
        if (flowNode.isSign()) {
            // 会签下所有人尚未提交时，不执行下一节点
            boolean allDone = currentFlowRecords.stream().allMatch(FlowRecord::isDone);
            if (!allDone) {
                // 流程尚未审批结束直接退出
                return;
            }
            // 会签下所有人都同意，再执行下一节点
            boolean allPass = currentFlowRecords.stream().allMatch(FlowRecord::isPass);
            if (!allPass) {
                flowNextStep = false;

            }

            historyRecords.addAll(currentFlowRecords);
        }
        // 非会签处理流程
        if (flowNode.isUnSign()) {
            // 非会签下，默认将所有人为提交的流程，都自动提交然后再执行下一节点
            for (FlowRecord record : currentFlowRecords) {
                if (record.getId() != recordId) {
                    record.autoDone(currentOperator, snapshot);
                    flowRecordRepository.update(flowRecord);
                    historyRecords.add(record);
                }
            }
        }

        String processId = flowRecord.getProcessId();

        // 拥有退出条件 或审批通过时，匹配下一节点
        if (flowWork.hasBackRelation() || flowNextStep) {
            FlowRecordService flowRecordService = new FlowRecordService(flowOperatorRepository, processId, createOperator, currentOperator, snapshot, opinion, flowWork, flowNextStep, historyRecords);
            FlowNode nextNode = flowRecordService.matcherNextNode(flowNode);
            if (nextNode == null) {
                throw new IllegalArgumentException("next node not found");
            }
            List<FlowRecord> records = flowRecordService.createRecord(flowRecord.getId(), nextNode);
            flowRecordRepository.save(records);
        } else {
            // 拒绝时，默认返回上一个节点
            FlowRecord preRecord = flowRecordRepository.getFlowRecordById(flowRecord.getPreId());
            // 去除所有的转办的记录
            while (preRecord.isTransfer()) {
                // 继续寻找上一个节点
                preRecord = flowRecordRepository.getFlowRecordById(preRecord.getPreId());
            }

            FlowRecordService flowRecordService = new FlowRecordService(flowOperatorRepository, processId, createOperator, currentOperator, snapshot, opinion, flowWork, flowNextStep, historyRecords);
            FlowNode nextNode = flowWork.getNodeByCode(preRecord.getNodeCode());
            if (nextNode == null) {
                throw new IllegalArgumentException("next node not found");
            }
            List<FlowRecord> records = flowRecordService.createRecord(preRecord.getId(), nextNode);
            flowRecordRepository.save(records);
        }

    }

}
