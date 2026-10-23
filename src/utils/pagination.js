// 后端分页参数在不同接口上存在 currentPage / page / current 三种命名，
// 这里统一成 currentPage，并同时携带 page，兼容只认 page 的接口
export const normalizePageParams = (params = {}) => {
  const { current, page, total, ...rest } = params
  const currentPage = params.currentPage ?? page ?? current ?? 1
  return {
    ...rest,
    currentPage,
    page: currentPage
  }
}
