const resources = api => ({
  getAll: ({ user, device }) => api.get(`/v2/users/${user}/devices/${device}/api`),
  get: ({ user, device, resource }) => api.get(`/v2/users/${user}/devices/${device}/${resource}/api`),
  post: ({
    user, device, resource, values,
  }) => api.post(`/v2/users/${user}/devices/${device}/${resource}`, { in: values }),
  run: ({ user, device, resource }) => api.get(`/v2/users/${user}/devices/${device}/${resource}`),
});

export default resources;