function makeUsersArr() {
  return [
    {
      email: "test1@test.com",
      password: "$2a$12$p7HLrkYZeOfK3LFpVmgwC.ola5QMCCuMOK2vIL1u2I40CxzgHxUpK",
      datecreated: new Date().toISOString(),
    },
    {
      email: "test2@test.com",
      password: "$2a$12$kOQEtgNL16aHNiod8pq.C.WWH3gL0eunV3LcVLFAJmvKIMhanxuVm",
      datecreated: new Date().toISOString(),
    },
    {
      email: "test3@test.com",
      password: "$2a$12$kLIhYGQuBv0VPr2XcOpcROYQrktQtLwmQ7nv4CzGeP3akvBk6ljRe",
      datecreated: new Date().toISOString(),
    },
  ];
}

module.exports = { makeUsersArr };
