const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const app = express();

//middlewere
app.use(cors());
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kryxy3e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const appointmentOptionCollection = client
      .db("doctorsPortal")
      .collection("appointmentOptions");
    const bookingsCollection = client
      .db("doctorsPortal")
      .collection("bookings");

    // use aggregate to query multiple collection and then merge data
    app.get("/appointmentOptions", async (req, res) => {
      // date ta nissi
      const date = req.query.date;

      const query = {};
      const options = await appointmentOptionCollection.find(query).toArray();

      //oi particular date er booking ki ki ase seida filter krtese(mane joto option ase sobgular jonno)
      const bookingQuery = { appointmentDate: date };
      const alredyBooked = await bookingsCollection
        .find(bookingQuery)
        .toArray();

      // code carefully :D
      options.forEach((option) => {
        // particular option er jonno booked ase kina dekhtesi
        const optionBooked = alredyBooked.filter(
          (book) => book.treatment === option.name
        );
        // particular option er jonno kon kon slot book hoa gase seita bar kortesi
        const bookedSlots = optionBooked.map((book) => book.slot);
        console.log(date, option.name, bookedSlots);
      });
      res.send(options);
    });

    /*
     * API naming conventions
     * app.get('/bookings')
     * app.get('/bookings/:id')
     * app.post('/bookings')
     * app.patch('/bookings/:id')
     * app.delete('/bookings/:id')
     */

    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("doctors portal server is running");
});

app.listen(port, () => console.log(`Doctors portal running on:${port}`));
