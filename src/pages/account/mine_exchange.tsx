import { useState } from 'react';
import { PageContainer, ProTable, ModalForm, ProFormDigit, ProFormDateTimeRangePicker  } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import moment from 'moment';
import { Button, message, Modal, Typography } from 'antd';
import { getMineExchangeList, getMineStatistic, addMineExchange, stopMineExchange } from '@/services/apis';
import React, { useRef } from 'react';

export type TableListItem = {
  mineBatch: string;
  startExchangeTime: number;
  stopExchangeTime	: number;
  level1totalCanExchange: number;
  level1score: number;
  level2totalCanExchange: number;
  level2score: number;
  operateAdminId: string | null;
  status: number;
};

const MineExchange: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal()
  const [modalVisit, setModalVisit] = useState(false);
  const [statistic, setStatistic] = useState<any>({
    level1Send: 0,
    level2Send: 0,
    totalSend: 0,
  });
  const ref = useRef();
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const valueEnum  = {
    '1': '已开始',
    '2': '已结束',
    '0': '待开始',
    '-1': '已弃用',
  }
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '兑换时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '批次号',
      dataIndex: 'mineBatch',
      hideInSearch: true,
    },
    {
      title: '兑换开始时间',
      dataIndex: 'startExchangeTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '一级矿机数量',
      dataIndex: 'level1totalCanExchange',
      hideInSearch: true,
    },
    {
      title: '一级积分',
      dataIndex: 'level1score',
      hideInSearch: true,
    },
    {
      title: '二级矿机数量',
      dataIndex: 'level2totalCanExchange',
      hideInSearch: true,
    },
    {
      title: '二级积分',
      dataIndex: 'level2score',
      hideInSearch: true,
    },
    {
      title: '兑换结束时间',
      dataIndex: 'stopExchangeTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '设置人',
      dataIndex: 'operateAdminId',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      render: (text) => {
        return valueEnum[text] || text;
      }
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      valueType: 'option',
      render: (text, record, _, action) => {
        return [
          <a
            key="delete"
            onClick={() => {
              modal.confirm({
                title: '弃用',
                content: <div>弃用批次号 <Typography.Text type="danger">{record.mineBatch}</Typography.Text></div>,
                okText: '确认',
                cancelText: '取消',
                onOk: async (e) => {
                  const params = {
                    mineBatch: record.mineBatch,
                  }
                  const msg = await stopMineExchange({params})
                  if (msg.success) {
                    message.success('弃用成功')
                    // 刷新表格
                    action?.reload()
                  }
                  return true
                }
              });
            }}
          >
            弃用
          </a>,
        ]
      }
    },
  ]
  const getMineList = async (params, sort, filter) => {
    const msg = await getMineExchangeList({
      params: {
        pageIndex: params.current,
        pageSize: params.pageSize,
        startTime: params.startTime ? moment(params.startTime).format('x') : '',
        endTime: params.endTime ? moment(params.endTime).format('x') : '',
      }
    })
    if (params.current === 1) {
      const smsg  = await getMineStatistic()
      if (smsg.success) {
        setStatistic(smsg.data)
      }
    }
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
  return (
    <PageContainer>
      {contextHolder}
      <ProTable<TableListItem>
        actionRef={ref}
        // dataSource={[]}
        request={(params,sort,filter) => getMineList(params,sort, filter)}
        rowKey="userId"
        pagination={{
          showQuickJumper: true,
          pageSize: 5
        }}
        columns={columns}
        search={{
          labelWidth: 'auto',
        }}
        // dateFormatter="string"
        headerTitle={`总计发放矿机: ${statistic?.totalSend}，一级矿机: ${statistic?.level1Send}，二级矿机: ${statistic?.level2Send}:`}
        toolBarRender={() => [
          <Button key="primary" onClick={async () => {
            await setModalType('create');
            await setModalVisit(true);
          }}>
            添加兑换
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

export default MineExchange;

