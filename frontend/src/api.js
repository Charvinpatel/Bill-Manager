import axios from 'axios';

const API = axios.create({ baseURL: "https://bill-manager-sannipatel.onrender.com/api" });

export const getAllBills = () => API.get('/bills');
export const getBillById = (id) => API.get(`/bills/${id}`);
export const createBill = (data) => API.post('/bills', data);
export const updateBillStatus = (id, status) => API.patch(`/bills/${id}/status`, { status });
export const deleteBill = (id) => API.delete(`/bills/${id}`);
export const getStats = () => API.get('/bills/stats');
