import seeder from "mongoose-seed";

const db = "mongodb://127.0.0.1:27017/academe?gssapiServiceName=mongodb";

seeder.connect(db, () => {
  seeder.loadModels([
    "./dist/modules/user/models/user.model",
    "./dist/modules/class/models/class.model",
    "./dist/modules/session/models/session.model",
  ]);
  seeder.clearModels(["User", "Session", "Class"], () => {
    seeder.populateModels(data, () => {
      seeder.disconnect();
    });
  });
});

const data = [
  {
    model: "Class",
    documents: [
      {
        _id: "QUc0jHFaM",
        name: "Saturday Afternoon",
        tutees: ["XYZwKtjz5Y"],
        tutors: ["7fCzBZf3_Q"],
        image:
          "https://images.unsplash.com/photo-1543165796-5426273eaab3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
        description:
          "Bacon ipsum dolor amet andouille beef ribs tail hamburger, pork belly short loin pork burgdoggen swine leberkas kielbasa. Brisket rump corned beef, short loin flank cupim capicola leberkas.",
        location: "Upper Riccarton Library",
        pricePerTutee: 5,
      },
    ],
  },
  {
    model: "User",
    documents: [
      {
        _id: "7fCzBZf3_Q",
        academics: ["Classics"],
        extras: ["Lighting/Sound"],
        classes: ["QUc0jHFaM"],
        sessions: [],
        // dateJoined: ISODate("2020-04-25T10:11:15.167Z"),
        // lastAuthenticated: ISODate("2020-04-26T00:40:19.636Z"),
        userType: "TUTEE",
        name: "Bruce Chen",
        email: "brucecccccc@gmail.com",
        password:
          "$2b$12$p6Y05HEDwPEzCo70EPi6Me1laeucnw2Fw.8bd6KQcpi9WqWbdEswO",
        yearGroup: 10,
        school: "Christ's College",
        biography: "Hi there,",
        registrationStatus: "COMPLETE",
        emailConfirmId: "mFVZQ6oPK",
        __v: 0,
      },
      {
        _id: "XYZwKtjz5Y",
        academics: ["English", "Mathematics"],
        extras: ["Programming"],
        classes: [],
        sessions: [],
        // dateJoined: ISODate("2020-04-25T06:45:08.450Z"),
        // lastAuthenticated: ISODate("2020-04-25T06:45:08.450Z"),
        userType: "TUTEE",
        name: "Bruce CCCC",
        email: "brchen@student.christscollege.com",
        password:
          "$2b$12$0ExEDibabznlX2Tkd/Gq1OcuhF396WOzdn6CrXY3/XITYYa4XM60i",
        yearGroup: 8,
        school: "Christ's College",
        biography: "IJAsodijaosidj",
        registrationStatus: "COMPLETE",
        emailConfirmId: "kT6CtaF-I",
        __v: 0,
      },
    ],
  },
];
