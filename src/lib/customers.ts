import api from './axios'
import type { Customer, CustomerRequest } from './types'

 export const  getCustomers = ():   Promise<Customer[]> =>
     api.get <Customer[]>('/api/customers'). then(r => r. data)

export const createCustomer = (data: CustomerRequest): Promise<Customer> =>
     api.post<Customer>  ('/api/customers', data).then(r => r.data)

export const updateCustomer = (id: number, data: CustomerRequest): Promise<Customer> =>
    api .put < Customer>(`/api/customers/${id}`, data). then(r => r.data )

export const deleteCustomer = (id: number): Promise<void> =>
    api.delete (`/api/customers/${id}`).then(() => undefined  )