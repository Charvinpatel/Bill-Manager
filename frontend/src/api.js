import axios from 'axios'

const API = axios.create({ baseURL: 'https://bill-manager-nazk.onrender.com/api' })

export const getAllBills       = (params = {}) => API.get('/bills', { params })
export const getBillById       = (id)         => API.get(`/bills/${id}`)
export const createBill        = (data)       => API.post('/bills', data)
export const updateBillStatus  = (id, status) => API.patch(`/bills/${id}/status`, { status })
export const deleteBill        = (id)         => API.delete(`/bills/${id}`)
export const getStats          = ()           => API.get('/bills/stats')
export const updateBill        = (id, data)   => API.put(`/bills/${id}`, data)
export const getAllVendors     = ()           => API.get('/bills/vendors')

export const getBillsByMonth = (year, month, vendorName = null, allTime = false) => {
  let url = `/bills/monthly?year=${year}&month=${month}`
  if (vendorName) url += `&vendorName=${encodeURIComponent(vendorName)}`
  if (allTime) url += `&allTime=true`
  return API.get(url)
}
