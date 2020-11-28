function makeCategoriesArr() {
  return [
    {
      id: 1,
      title: "Weeding",
      datecreated: new Date().toISOString(),
      userid: 1,
    },
    {
      id: 2,
      title: "Feeding",
      datecreated: new Date().toISOString(),
      userid: 1,
    },
    {
      id: 3,
      title: "Watering",
      datecreated: new Date().toISOString(),
      userid: 1,
    },
  ];
}

module.exports = { makeCategoriesArr };
