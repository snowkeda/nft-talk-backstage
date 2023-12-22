import { useState } from 'react';
import { PageContainer, ProTable, ModalForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import type { ProColumns, ProFormInstance  } from '@ant-design/pro-components';
import _ from 'lodash';
import { useModel } from '@umijs/max';
import { Button, message, Modal, Typography } from 'antd';
import { getBackstageUserList, addBackstageUser, editBackstageUser, delBackstageUser } from '@/services/apis';
import React, { useRef } from 'react';

export type TableListItem = {
  userId: number;
  username: string;
  email: string;
  userType: number;
  brokerId: number;
  gmtCreate: number;
  freeze: boolean;
  password: string | null;
  normalPower: number;
  auditPower: number;
  adminPower: number;
};

const User: React.FC = () => {
  const [modal, contextHolder] = Modal.useModal()
  const [modalVisit, setModalVisit] = useState(false);
  const ref = useRef();
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [modalData, setModalData] = useState<TableListItem>({});
  const valueEnum  = {
    1: '是',
    0: '否',
  }
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '添加日期',
      dataIndex: 'gmtCreate',
      valueType: 'dateTime',
    },
    {
      title: '一般权限',
      dataIndex: 'normalPower',
      valueEnum
    },
    {
      title: '审批权限',
      dataIndex: 'auditPower',
      valueEnum
    },
    {
      title: '系统管理员权限',
      dataIndex: 'adminPower',
      valueEnum
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
                title: '删除',
                content: <div>管理员 <Typography.Text type="danger">{record.username}</Typography.Text></div>,
                okText: '确认',
                cancelText: '取消',
                onOk: async (e) => {
                  const params = {
                    username: record.username,
                  }
                  const msg = await delBackstageUser({params})
                  if (msg.success) {
                    message.success('删除成功')
                    // 刷新表格
                    action?.reload()
                  }
                  return true
                }
              });
            }}
          >
            删除
          </a>,
          <a
            key="editable"
            onClick={async () => {
              await setModalData(record)
              await setModalType('edit')
              await setModalVisit(true)
            }}
          >
            编辑
          </a>,
        ]
      }
    },
  ]
  const getUserList = async (params,sort, filter) => {
    const msg = await getBackstageUserList({
      params: {
        pageIndex: params.current,
        pageSize: params.pageSize,
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
  const getPower = () => {
    const arr = [];
    const strArr = ['normalPower', 'auditPower', 'adminPower']
    const { normalPower, auditPower, adminPower } = modalData;
    strArr.map((item) => {
      modalData[item] === 1 ? arr.push(item) : '';
    })
    return arr
  }
  const options = [
    { label: '一般权限', value: 'normalPower' },
    { label: '审批权限', value: 'auditPower' },
    { label: '系统管理', value: 'adminPower' },
  ]
  const onFinish = async (values) => {
    console.log(values)
    const { power } = values;
    const powerObj = {};
    options.map((item, index) => {
      const a =  _.find(power, function(o) { return o === item.value; });
      console.log(a)
      powerObj[item.value] = a ? 1 : 0;
    })
    const params = {
      username: values.username,
      password: values.password,
      ...powerObj,
    }
    console.log(params)
    if (modalType === 'create') {
      const msg = await addBackstageUser({
        params
      })
      msg.data && message.success('添加成功')
    } else if (modalType === 'edit') {
      const editMsg = await editBackstageUser({
        params: {
          username: values.username,
          password: values.password,
          ...powerObj,
        }
      })
      editMsg.data && message.success('编辑成功')
    }
    await ref.current.reload()
    await setModalVisit(false)
  }
  console.log(modalData)
  return (
    <PageContainer>
      {contextHolder}
      <ProTable<TableListItem>
        actionRef={ref}
        // dataSource={tableListDataSource}
        request={(params,sort,filter) => getUserList(params,sort, filter)}
        rowKey="userId"
        pagination={{
          showQuickJumper: true,
          pageSize: 5
        }}
        columns={columns}
        search={false}
        // dateFormatter="string"
        headerTitle=""
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={async () => {
            await setModalType('create');
            await setModalVisit(true);
          }}>
            添加用户
          </Button>,
        ]}
      />
      <ModalForm
        title={modalType === 'create' ? "添加用户" : "编辑用户"}
        open={modalVisit}
        width={600}
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
      /*   onFinish={async () => {
          message.success('提交成功');
          return true;
        }} */
        // onOpenChange={setModalVisit}
      >
        <ProFormText
          name="username"
          readonly={modalType === 'edit' ? true : false}
          initialValue={modalType === 'create' ? '' : modalData.username}
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        />
        <ProFormText.Password
          name="password"
          label="密码"
          // fieldProps={{
          //   autoComplete:"off"
          // }}
          placeholder="请输入密码"
          rules={[{ required: true, message: '请输入密码' }]}
        />
        <ProFormCheckbox.Group
          name="power"
          layout="horizontal"
          label="权限"
          initialValue={modalType === 'create' ? [] : getPower()}
          options={options}
          rules={[{ required: true, message: '请选择权限' }]}
        />
      </ModalForm>
    </PageContainer>
  )
};

export default User;
