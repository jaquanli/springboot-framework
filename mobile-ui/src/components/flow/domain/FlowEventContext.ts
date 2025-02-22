import React from "react";
import {FormAction} from "@/components/form";
import {FlowRecordContext} from "@/components/flow/domain/FlowRecordContext";
import {FlowStateContext} from "@/components/flow/domain/FlowStateContext";
import * as flowApi from "@/api/flow";
import {FlowButton, FlowUser} from "@/components/flow/types";
import {Toast} from "antd-mobile";
import {FlowSubmitResultParser, FlowTrySubmitResultParser} from "@/components/flow/domain/FlowResultParser";
import {UserSelectMode} from "@/components/flow/store/FlowSlice";
import {FlowTriggerContext} from "@/components/flow/domain/FlowTriggerContext";

/**
 * 流程的事件控制上下文对象
 */
export class FlowEventContext {

    private readonly flowRecordContext: FlowRecordContext;
    private readonly flowTriggerContext: FlowTriggerContext;
    private readonly flowAction: React.RefObject<FormAction>;
    private readonly opinionAction: React.RefObject<FormAction>;
    private readonly flowStateContext: FlowStateContext;

    constructor(flowViewContext: FlowRecordContext,
                flowTriggerContext:FlowTriggerContext,
                flowAction: React.RefObject<FormAction>,
                opinionAction: React.RefObject<FormAction>,
                flowStateContext: FlowStateContext) {
        this.flowRecordContext = flowViewContext;
        this.flowTriggerContext = flowTriggerContext;
        this.flowAction = flowAction;
        this.opinionAction = opinionAction;
        this.flowStateContext = flowStateContext;
    }

    private getRequestBody = () => {
        const formData = this.flowAction.current?.getFieldsValue();
        const flowData = this.flowRecordContext.getFlowFormParams();
        const workCode = this.flowRecordContext.getWorkCode();
        const recordId = this.flowStateContext.getRecordId();
        const advice = this.opinionAction.current?.getFieldsValue();

        return {
            recordId,
            workCode,
            ...advice,
            formData: {
                ...flowData,
                ...formData,
            }
        }
    }


    private validateForm = async () => {
        const formState = await this.flowAction.current?.validate();
        const opinionState = await this.opinionAction.current?.validate();
        return formState && opinionState;
    }

    /**
     * 发起流程
     * @param callback 回调函数
     */
    startFlow = (callback?: (res: any) => void) => {
        const body = this.getRequestBody();
        this.flowStateContext.setRequestLoading(true);
        flowApi.startFlow(body)
            .then(res => {
                if (res.success) {
                    const newRecordId = res.data.records[0].id;
                    this.flowStateContext.setRecordId(newRecordId);

                    if (callback) {
                        callback(res);
                    }
                }
            })
            .finally(() => {
                this.flowStateContext.setRequestLoading(false);
            })
    }


    /**
     * 提交流程
     * @param approvalState 是否审批通过
     * @param callback 回调函数
     * @param operatorIds 指定审批人
     */
    submitFlow = (approvalState: boolean, callback?: (res: any) => void, operatorIds?: number[]) => {
        this.validateForm().then((validateState) => {
            if (validateState) {
                const body = {
                    ...this.getRequestBody(),
                    success: approvalState,
                    operatorIds: operatorIds,
                }
                this.flowStateContext.setRequestLoading(true);
                flowApi.submitFlow(body)
                    .then(res => {
                        if (res.success) {
                            if (callback) {
                                callback(res);
                            }
                        }
                    })
                    .finally(() => {
                        this.flowStateContext.setRequestLoading(false);
                    })
            }
        })
    }

    /**
     * 删除流程
     * @param callback 回调函数
     */
    removeFlow = (callback?: (res: any) => void) => {
        this.flowStateContext.setRequestLoading(true);
        const body = {
            recordId: this.flowStateContext.getRecordId()
        };
        flowApi.removeFlow(body).then(res => {
            if (res.success) {
                if (callback) {
                    callback(res);
                }
            }
        }).finally(() => {
            this.flowStateContext.setRequestLoading(false);
        })
    }

    /**
     * 保存流程
     * @param callback 回调函数
     */
    saveFlow = (callback?: (res: any) => void) => {
        this.flowStateContext.setRequestLoading(true);
        const body = this.getRequestBody();
        flowApi.saveFlow(body).then(res => {
            if (res.success) {
                if (callback) {
                    callback(res);
                }
            }
        }).finally(() => {
            this.flowStateContext.setRequestLoading(false);
        })
    }

    /**
     * 延期流程
     * @param timeOut 延期时间
     * @param callback 回调函数
     */
    postponedFlow(timeOut: number, callback?: (res: any) => void) {
        this.flowStateContext.setRequestLoading(true);
        const body = {
            recordId: this.flowStateContext.getRecordId(),
            timeOut
        };
        flowApi.postponed(body).then(res => {
            if (res.success) {
                if (callback) {
                    callback(res);
                }
            }
        }).finally(() => {
            this.flowStateContext.setRequestLoading(false);
        })
    }

    /**
     * 自定义流程
     * @param button 自定义按钮
     * @param callback 回调函数
     */
    customFlow(button: FlowButton, callback?: (res: any) => void) {
        this.validateForm().then((validateState) => {
            console.log('validateState', validateState);
            if (validateState) {
                const body = {
                    ...this.getRequestBody(),
                    buttonId: button.id,
                }
                this.flowStateContext.setRequestLoading(true);
                flowApi.custom(body)
                    .then(res => {
                        if (res.success) {
                            if (callback) {
                                callback(res);
                            }
                        }
                    })
                    .finally(() => {
                        this.flowStateContext.setRequestLoading(false);
                    })
            }
        })
    }

    /**
     * 转办流程
     * @param user 转办用户
     * @param callback 回调函数
     */
    transferFlow(user: FlowUser, callback?: (res: any) => void) {
        this.validateForm().then((validateState) => {
            if (validateState) {
                const body = {
                    ...this.getRequestBody(),
                    targetUserId: user.id
                }
                this.flowStateContext.setRequestLoading(true);
                flowApi.transfer(body)
                    .then(res => {
                        if (res.success) {
                            if (callback) {
                                callback(res);
                            }
                        }
                    })
                    .finally(() => {
                        this.flowStateContext.setRequestLoading(false);
                    })
            }
        })
    }

    /**
     * 催办流程
     * @param callback
     */
    urgeFlow(callback?: (res: any) => void) {
        this.flowStateContext.setRequestLoading(true);
        const body = {
            recordId: this.flowStateContext.getRecordId()
        };
        flowApi.urge(body).then(res => {
            if (res.success) {
                if (callback) {
                    callback(res);
                }
            }
        }).finally(() => {
            this.flowStateContext.setRequestLoading(false);
        })
    }

    /**
     * 撤回流程
     */
    recallFlow(callback?: (res: any) => void) {
        this.flowStateContext.setRequestLoading(true);
        const body = {
            recordId: this.flowStateContext.getRecordId()
        };
        flowApi.recall(body).then(res => {
            if (res.success) {
                if (callback) {
                    callback(res);
                }
            }
        }).finally(() => {
            this.flowStateContext.setRequestLoading(false);
        })
    }

    /**
     * 预提交流程
     * @param callback
     */
    trySubmitFlow(callback?: (res: any) => void) {
        this.validateForm().then((validateState) => {
            if (validateState) {
                const body = {
                    ...this.getRequestBody(),
                    success: true,
                }
                this.flowStateContext.setRequestLoading(true);
                flowApi.trySubmitFlow(body)
                    .then(res => {
                        if (res.success) {
                            if (callback) {
                                callback(res);
                            }
                        }
                    })
                    .finally(() => {
                        this.flowStateContext.setRequestLoading(false);
                    })
            }
        })
    }



    userSelectCallback(users: FlowUser[], userSelectMode: UserSelectMode | null) {
        if (users.length > 0) {
            if (userSelectMode) {
                if (userSelectMode.userSelectType === 'transfer') {
                    const targetUser = users[0];
                    this.transferFlow(targetUser, (res) => {
                        const message = `已经成功转办给${targetUser.name}`;
                        this.flowStateContext.setResult({
                            state: 'success',
                            closeable: true,
                            title: message,
                        });
                    });
                }
                if (userSelectMode.userSelectType === 'nextNodeUser') {
                    const userIds = users.map((item: any) => {
                        return item.id;
                    });
                    this.submitFlow(true, (res) => {
                        const flowSubmitResultParser = new FlowSubmitResultParser(res.data);
                        this.flowStateContext.setResult(flowSubmitResultParser.parser());
                    }, userIds);
                }
            }
        }

        this.flowStateContext.setUserSelectVisible(false);
    }

    /**
     * 处理按钮点击事件
     * @param button
     */
    handlerClick(button: FlowButton) {
        if (button.type === "RELOAD") {
            //todo
        }

        if (button.type === 'SAVE') {
            if (this.flowStateContext.hasRecordId()) {
                this.saveFlow(() => {
                    Toast.show('流程保存成功');
                })
            } else {
                this.startFlow(() => {
                    this.saveFlow(() => {
                        Toast.show('流程保存成功');
                    })
                });
            }
        }

        if (button.type === "START") {
            if (this.flowStateContext.hasRecordId()) {
                Toast.show('流程已发起，无需重复发起');
            } else {
                this.startFlow((res) => {
                    Toast.show('流程发起成功.');
                })
            }
        }
        if (button.type === 'SPECIFY_SUBMIT') {
            this.trySubmitFlow((res) => {
                const operators = res.data.operators;
                const userIds = operators.map((item: any) => {
                    return item.userId;
                });

                this.flowStateContext.setUserSelectMode({
                    userSelectType: 'nextNodeUser',
                    multiple: true,
                    specifyUserIds: userIds,
                });
            });
        }

        if (button.type === 'SUBMIT') {
            if (this.flowStateContext.hasRecordId()) {
                this.submitFlow(true, (res) => {
                    const flowSubmitResultParser = new FlowSubmitResultParser(res.data);
                    this.flowStateContext.setResult(flowSubmitResultParser.parser());
                })
            } else {
                this.startFlow(() => {
                    this.submitFlow(true, (res) => {
                        const flowSubmitResultParser = new FlowSubmitResultParser(res.data);
                        this.flowStateContext.setResult(flowSubmitResultParser.parser());
                    })
                });
            }
        }

        if (button.type === 'REJECT') {
            if (this.flowStateContext.hasRecordId()) {
                this.submitFlow(false, (res) => {
                    const flowSubmitResultParser = new FlowSubmitResultParser(res.data);
                    this.flowStateContext.setResult(flowSubmitResultParser.parser());
                })
            } else {
                Toast.show('流程尚未发起，无法操作');
            }
        }

        if (button.type === 'TRY_SUBMIT') {
            this.trySubmitFlow((res) => {
                const flowTrySubmitResultParser = new FlowTrySubmitResultParser(res.data);
                this.flowStateContext.setResult(flowTrySubmitResultParser.parser());
            });
        }

        if (button.type === 'RECALL') {
            this.recallFlow(() => {
                this.flowStateContext.setResult({
                    state: 'success',
                    closeable: true,
                    title: '流程撤回成功',
                });
            });
        }

        if (button.type === 'REMOVE') {
            if (this.flowStateContext.hasRecordId()) {
                this.removeFlow(() => {
                    this.flowStateContext.setResult({
                        state: 'success',
                        closeable: true,
                        title: '流程删除成功',
                    });
                });
            } else {
                Toast.show('流程尚未发起，无法删除');
            }
        }


        if (button.type === 'URGE') {
            this.urgeFlow(() => {
                this.flowStateContext.setResult({
                    state: 'success',
                    closeable: true,
                    title: '催办提醒已发送',
                });
            });
        }

        if (button.type === 'POSTPONED') {
            this.flowStateContext.setPostponedVisible(true);
        }


        if (button.type === 'TRANSFER') {
            this.flowStateContext.setUserSelectMode({
                userSelectType: 'transfer',
                multiple: false,
            });
        }

        if (button.type === "CUSTOM") {
            if (this.flowStateContext.hasRecordId()) {
                this.customFlow(button, (res) => {
                    const customMessage = res.data;
                    this.flowStateContext.setResult({
                        state: customMessage.resultState.toLowerCase(),
                        ...customMessage
                    });
                });
            } else {
                Toast.show('流程尚未发起，无法操作');
            }
        }

        if(button.type === 'VIEW'){
            const eventKey = button.eventKey;
            this.flowTriggerContext.trigger(eventKey);
        }

    }

}



