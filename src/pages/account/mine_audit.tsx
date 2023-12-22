import { useState } from 'react';
import { PageContainer, ProTable, ModalForm, ProFormDigit, ProFormDateTimeRangePicker  } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import _ from 'lodash';
import moment from 'moment';
import { Button, message, Modal, Typography } from 'antd';
import { getMineProduceList, auditMine } from '@/services/apis';
import React, { useRef } from 'react';

export type TableListItem = {
  id: number;
  userId: number;
  address: string;
  number: string;
  time: number;
  amount	: number;
  level: number;
  isAudit: number;
  auditList: any[];
};

const MineAudit: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal()
  const [modalVisit, setModalVisit] = useState(false);
  const [ids, setIds] = useState<any[]>([])
  const [statistic, setStatistic] = useState<any>({
    level1Send: 0,
    level2Send: 0,
    totalSend: 0,
  });
  const ref = useRef();
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const enumAudit = {
    '': '全部',
    '1': '已审批',
    '0': '未审批',
  }
  
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '用户名',
      dataIndex: 'userId',
      hideInTable: true,
    },
    {
      title: '审批',
      dataIndex: 'isAudit',
      valueType: 'select',
      hideInTable: true,
      valueEnum: enumAudit,
    },
    {
      title: '用户',
      dataIndex: 'address',
      hideInSearch: true,
    },
    {
      title: '收益日期',
      dataIndex: 'time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '矿机名称',
      dataIndex: 'number',
      hideInSearch: true,
      render: (text, record) => {
        return `${record.level}级矿机-${text}`
      }
    },
    {
      title: '空投数量',
      dataIndex: 'amount',
      hideInSearch: true,
    },
    {
      title: '是否空投',
      dataIndex: 'level2totalCanExchange',
      hideInSearch: true,
    },
    {
      title: '审批进度',
      dataIndex: 'auditList',
      hideInSearch: true,
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      valueType: 'option',
      render: (text, record, _, action) => {
        return record.isAudit === 0 ? [
          <a
            key="delete"
            onClick={() => {
              modal.confirm({
                title: '审批',
                content: <div>审批 矿机名称:<Typography.Text type="danger">{record.number}</Typography.Text></div>,
                okText: '确认',
                cancelText: '取消',
                onOk: async (e) => {
                  const params = {
                    ids: [record.id],
                  }
                  const msg = await auditMine({params})
                  if (msg.success) {
                    message.success('审批成功')
                    // 刷新表格
                    action?.reload()
                  }
                  return true
                }
              });
            }}
          >
            审批
          </a>,
        ] : [];
      }
    },
  ]
  const getMineList = async (params, sort, filter) => {
    console.log(params)
    const msg = await getMineProduceList({
      params: {
        pageIndex: params.current,
        pageSize: params.pageSize,
        ...params
      }
    })
    return {
      data: msg.data,
      // success 请返回 true，
      // 不然 table 会停止解析数据，即使有数据
      success: true,
      // 不传会使用 data 的长度，如果是分页一定要传
      total: msg.totalCount,
    };
  }
  const onFinish = async (values) => {
    const params = {
      startExchangeTime: moment(values.rangeTime[0]).format('x'),
      stopExchangeTime: moment(values.rangeTime[1]).format('x'),
      ...values,
    }
    delete params.rangeTime
    if (modalType === 'create') {
      const msg = await addMineExchange({
        params
      })
      msg.success && message.success('添加成功')
    } 
    // else if (modalType === 'edit') {
    //   const editMsg = await editBackstageUser({
    //     params: {
    //       username: values.username,
    //       password: values.password,
    //       ...powerObj,
    //     }
    //   })
    //   editMsg.data && message.success('编辑成功')
    // }
    await ref.current.reload()
    await setModalVisit(false)
  }
  const itemLayout = {
    layout: 'horizontal',
    labelCol: { span: 6 },
    wrapperCol: {span: 14}
  }
  console.log(ids)
  return (
    <PageContainer>
      {contextHolder}
      <ProTable<TableListItem>
        actionRef={ref}
        request={(params,sort,filter) => getMineList(params,sort, filter)}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          pageSize: 5
        }}
        columns={columns}
        search={{
          labelWidth: 'auto',
        }}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          // defaultSelectedRowKeys: [1],
          // selectedRowKeys: ids,
          onChange: (selectedRowKeys, selectedRows, info) => {
            setIds(selectedRowKeys)
          }
        }}
        // dateFormatter="string"
        // headerTitle={`总计发放矿机: ${statistic?.totalSend}，一级矿机: ${statistic?.level1Send}，二级矿机: ${statistic?.level2Send}:`}
        toolBarRender={(action) => [
          <Button type='primary' key="primary" onClick={async () => {
            modal.confirm({
              title: '审批',
              content: <div>审批 矿机名称:<Typography.Text type="danger"></Typography.Text></div>,
              okText: '确认',
              cancelText: '取消',
              onOk: async (e) => {
                const params = {
                  ids,
                }
                const msg = await auditMine({params})
                if (msg.success) {
                  message.success('审批成功')
                  // 刷新表格
                  action?.reload()
                }
                return true
              }
            });

          }} disabled={ids.length === 0}>
            批量审批
          </Button>,
        ]}
      />
      <ModalForm
        title={modalType === 'create' ? "添加矿机" : "编辑用户"}
        open={modalVisit}
        width={600}
        {...itemLayout}
        modalProps={{
          destroyOnClose: true,
          onCancel: async () => {
            await setModalType('create')
            await setModalVisit(false);
          }
        }}
        onFinish={async (value) => {
         await onFinish(value)
        }}
      >
        <ProFormDigit
          name="level1totalCanExchange"
          label="一级矿机数量"
          placeholder="请输入一级矿机数量"
          rules={[{ required: true, message: '请输入一级矿机数量' }]}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDigit
          name="level1score"
          label="一级积分"
          placeholder="请输入一级积分"
          rules={[{ required: true, message: '请输入一级积分' }]}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDigit
          name="level2totalCanExchange"
          label="二级矿机数量"
          placeholder="请输入二级矿机数量"
          rules={[{ required: true, message: '请输入二级矿机数量' }]}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDigit
          name="level2score"
          label="二级积分"
          placeholder="请输入二级积分"
          rules={[{ required: true, message: '请输入二级积分' }]}
          fieldProps={{ precision: 0 }}
        />
        <ProFormDateTimeRangePicker 
          name="rangeTime"
          label="开始停止兑换时间"
          placeholder={[ '开始兑换时间', '停止兑换时间' ]}
          rules={[{ required: true, message: '请选择停止兑换时间' }]}
        />
      </ModalForm>
    </PageContainer>
  )
};

export default MineAudit;


