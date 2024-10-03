import React from "react";
import {PageContainer, ProTable} from "@ant-design/pro-components";
import {todo} from "@/api/flow";

const FlowPage = () => {

    const data = {
        nodes: [
            {
                id: '1',
                type: 'start-node',
                x: 350,
                y: 100,
                properties: {
                    name: '开始节点',
                },
            },
        ],
        edges: [],
    }


    const columns = [
        {
            title: '编号',
            dataIndex: 'id',
        },
        {
            title: '标题',
            dataIndex: 'title',
        },
        {
            title: '解释',
            dataIndex: 'description',
        },

    ] as any[];
    return (
        <PageContainer>

            <ProTable
                columns={columns}
                request={async (params, sort, filter) => {
                    const res = await todo();
                    return {
                        data: res.data.list,
                        success: true,
                    }
                }}
            />
        </PageContainer>
    )
};

export default FlowPage;
