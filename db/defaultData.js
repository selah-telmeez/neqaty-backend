// Default data for a new (empty) database: the main admin user (code 1),
// the rows it depends on, and two starter organizations.
module.exports = {
  authorities: [
    { id: 4, name: "Wabys", createdAt: "2025-03-18T08:22:18.289Z", updatedAt: "2025-03-18T08:22:18.289Z" },
  ],
  organizations: [
    { id: 13, name: "Wabys", location: null, city: "القاهرة", type: "company", authority_id: 4, deleted: false, createdAt: "2025-03-18T08:22:18.289Z" },
  ],
  userRoles: [
    { id: 48, title: "admin", deleted: false, createdAt: "2026-09-30T01:57:37.738Z" },
  ],
  employeeRoles: [
    { id: 25, title: "CEO", deleted: false, createdAt: "2025-02-18T11:55:03.431Z" },
  ],
  users: [
    {
      id: 125,
      code: 1,
      password: "$2a$12$8ZkFl4A7Z8N0nh3Dd0954uTSn0TA9Vh1vqmsJodOeBGQpAPc7jRxS",
      role_id: 48,
      deleted: false,
      createdAt: "2025-04-13T13:43:48.137Z",
      upload_id: null,
    },
  ],
  employees: [
    {
      id: 34,
      first_name: "Mansour",
      middle_name: "Hassan",
      last_name: "Wahby",
      email: "m.wahby@ebda-edu.com",
      role_id: 25,
      organization_id: 13,
      user_id: 125,
      deleted: false,
      createdAt: "2025-04-13T13:43:48.144Z",
    },
  ],
  admins: [
    { id: 2, user_id: 125, role: "ceo", deleted: false, createdAt: "2025-05-28T11:29:12.244Z", updatedAt: "2025-05-28T11:29:12.244Z" },
  ],
  // created after the rows above, so they get fresh ids
  newOrganizations: [
    { name: "org 1", city: "القاهرة", type: "school", authority_id: 4 },
    { name: "org 2", city: "القاهرة", type: "school", authority_id: 4 },
  ],
};
