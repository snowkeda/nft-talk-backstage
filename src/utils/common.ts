/* {
  path: '/admin',
  name: 'admin',
  icon: 'crown',
  // access: 'canAdmin',
  routes: [
    {
      path: '/admin',
      redirect: '/admin/sub-page',
    },
    {
      path: '/admin/sub-page',
      name: 'sub-page',
      component: './Admin',
    },
  ],
}, */
export const getMenu = (authorities) => {
  const arr = [];
  authorities.map((item, index) => {
    const obj = {
      path: `/${item.authority}`,
      name: item.name,
      id: item.id,
      type: item.type,
      // ...item
    }
    const children = [];
    if (item.children?.length > 0) {
      item.children.map((ic, index) => {
        const childObj = {
          path: `/${ic.authority.replace(':', '/')}`,
          name: ic.name,
          id: ic.id,
          type: ic.type,
          component: `./${ic.authority.replace(':', '/')}`,
        }
        children.push(childObj)
      })
    } else {
      obj.component = `/${item.authority}`
    }
    obj.children = children;
    arr.push(obj)
  })
  console.log(arr)
  return arr
}