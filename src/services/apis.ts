import { request } from '@umijs/max';

const base = '/api'

const Authorization = sessionStorage.getItem('Authorization') || '';


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
      Authorization,
    }
  });
}
// 获取用户 信息、 菜单
export async function getAuthInfo(options) {
  console.log(options)
  return request(`${base}/auth/info`, {
    method: 'GET',
    headers: {
      Authorization: options.Authorization || Authorization,
    }
  });
}
// 管理用户列表
export async function getBackstageUserList(options) {
  return request(`${base}/backstage/user/list`, {
    method: 'GET',
    params: options.params,
    headers: {
      Authorization: options.Authorization || Authorization,
    }
  });
}
// 添加管理员 /backstage/user/add
export async function addBackstageUser(options) {
  return request(`${base}/backstage/user/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization,
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
      Authorization,
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
      Authorization,
    },
    data: options.params,
  });
}