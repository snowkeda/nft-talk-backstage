import { request } from '@umijs/max';

const base = '/api'

const Authorization = () => {
  return sessionStorage.getItem('Authorization') || '';
}


// 登录 获取token
export async function login(body, options?: { [key: string]: any }) {
  return request(`${base}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 退出登录接口 /auth/outLogin */
export async function getAuthLogout() {
  return request(`${base}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: Authorization(),
    }
  });
}
// 获取用户 信息、 菜单
export async function getAuthInfo(options) {
  console.log(options)
  return request(`${base}/auth/info`, {
    method: 'GET',
    headers: {
      Authorization: options.Authorization || Authorization(),
    }
  });
}
// 管理用户列表
export async function getBackstageUserList(options) {
  return request(`${base}/backstage/user/list`, {
    method: 'GET',
    params: options.params,
    headers: {
      Authorization: options.Authorization || Authorization(),
    }
  });
}
// 添加管理员 /backstage/user/add
export async function addBackstageUser(options) {
  return request(`${base}/backstage/user/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization(),
    },
    data: options.params,
  });
}
// 编辑管理员
export async function editBackstageUser(options) {
  return request(`${base}/backstage/user/edit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization(),
    },
    data: options.params,
  });
}
// 删除
export async function delBackstageUser(options) {
  return request(`${base}/backstage/user/del`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization(),
    },
    data: options.params,
  });
}
// 矿机兑换列表 
export async function getMineExchangeList(options) {
  return request(`${base}/mine/config`, {
    method: 'GET',
    params: options.params,
    headers: {
      Authorization: options.Authorization || Authorization(),
    }
  });
}
// 矿机统计
export async function getMineStatistic(options = {}) {
  return request(`${base}/mine/statistic`, {
    method: 'GET',
    params: options?.params,
    headers: {
      Authorization: options.Authorization || Authorization(),
    }
  });
}
// 矿机兑换 新增  /mine/add
export async function addMineExchange(options) {
  return request(`${base}/mine/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization(),
    },
    data: options.params,
  });
}
// 矿机兑换-启用 /mine/stop
export async function stopMineExchange(options) {
  return request(`${base}/mine/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization(),
    },
    data: options.params,
  });
}
// 矿机审批-列表
export async function getMineProduceList(options = {}) {
  return request(`${base}/mine/produce-list`, {
    method: 'GET',
    params: options?.params,
    headers: {
      Authorization: options.Authorization || Authorization(),
    }
  });
}
// 矿机审批-批量审批
export async function auditMine(options) {
  return request(`${base}/mine/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Authorization(),
    },
    data: options.params,
  });
}