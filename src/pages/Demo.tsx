import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const Demo: React.FC = () => {
  const init= useModel('@@initialState');
  const { initialState }= useModel('@@initialState');
  const demo = useModel('demo');
  return (
    <PageContainer>
      {demo.counter}
      <button onClick={() => demo.increment()}>add</button>
      <button onClick={() => demo.decrement()}>decrement</button>
    </PageContainer>
  )
};

export default Demo;
