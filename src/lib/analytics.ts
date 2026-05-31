import api from './axios'
import type { OverviewResponse, MonthlyCountDTO, DistributionEntry, TaskByUserDTO } from './types'

export const getOverview = () =>
  api.get<OverviewResponse>('/api/analytics/overview').then(r => r.data)

export const getCustomerGrowth = (months = 6) =>
  api.get<MonthlyCountDTO[]>(`/api/analytics/customers/growth?months=${months}`).then(r => r.data)

export const getTaskStatus = () =>
  api.get<DistributionEntry[]>('/api/analytics/tasks/status').then(r => r.data)

export const getTaskPriority = () =>
  api.get<DistributionEntry[]>('/api/analytics/tasks/priority').then(r => r.data)

export const getTaskType = () =>
  api.get<DistributionEntry[]>('/api/analytics/tasks/type').then(r => r.data)

export const getTaskWorkload = () =>
  api.get<TaskByUserDTO[]>('/api/analytics/tasks/workload').then(r => r.data)

export const getCampaignStatus = () =>
  api.get<DistributionEntry[]>('/api/analytics/campaigns/status').then(r => r.data)

export const getCampaignMonthly = (months = 6) =>
  api.get<MonthlyCountDTO[]>(`/api/analytics/campaigns/monthly?months=${months}`).then(r => r.data)
