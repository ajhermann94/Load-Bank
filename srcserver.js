const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

const DEFAULT_UPS_CAPACITY = 2000;
const DEFAULT_STS_CAPACITY = 500;
const DEFAULT_BUSWAY_CAPACITY = 250;

app.post('/schedule', (req, res) => {
    const {
        upsCount = 4,
        stsPerUps = 5,
        buswaysPerPdu = 4,
        testDurationHrs = 4,
        buswayDurationMin = 30,
        loadLevels = { "25%": 500, "50%": 1000, "100%": 2000 },
        upsCapacity = DEFAULT_UPS_CAPACITY,
        stsCapacity = DEFAULT_STS_CAPACITY,
        buswayCapacity = DEFAULT_BUSWAY_CAPACITY
    } = req.body;

    const schedule = generateSchedule(
        upsCount, stsPerUps, buswaysPerPdu, testDurationHrs, buswayDurationMin,
        loadLevels, upsCapacity, stsCapacity, buswayCapacity
    );
    res.json({ schedule });
});

function generateSchedule(upsCount, stsPerUps, buswaysPerPdu, testDurationHrs, buswayDurationMin, loadLevels, upsCapacity, stsCapacity, buswayCapacity) {
    let schedule = [];
    const startTime = new Date();
    const formatter = { hour: '2-digit', minute: '2-digit', hour12: false };

    schedule.push("UPS Burn-In Test Schedule");
    schedule.push(`Start Time: ${startTime.toLocaleString()}`);

    for (let ups = 1; ups <= upsCount; ups++) {
        schedule.push(`\n=== UPS ${ups} Testing ===`);
        let currentTime = new Date(startTime);

        for (const [loadName, loadKw] of Object.entries(loadLevels)) {
            schedule.push(`\n${loadName} Load Test (${loadKw} kW) - ${testDurationHrs} Hours`);
            const stsCount = Math.ceil(loadKw / stsCapacity);
            const activeBusways = Math.ceil(loadKw / buswayCapacity);
            const totalMinutes = testDurationHrs * 60;
            const intervals = Math.ceil(totalMinutes / buswayDurationMin);

            for (let interval = 0; interval < intervals; interval++) {
                const startInterval = new Date(currentTime.getTime() + interval * buswayDurationMin * 60000);
                const endInterval = new Date(startInterval.getTime() + buswayDurationMin * 60000);

                const stsStart = (interval % stsPerUps) + 1;
                let activeSts = [stsStart];
                for (let j = 1; j < Math.min(stsCount, stsPerUps); j++) {
                    activeSts.push((stsStart + j - 1) % stsPerUps + 1);
                }

                let buswayAssignments = [];
                let buswaysUsed = 0;
                for (const sts of activeSts) {
                    const buswaysNeeded = Math.min(
                        Math.floor(stsCapacity / buswayCapacity),
                        activeBusways - buswaysUsed
                    );
                    const startBusway = (interval % buswaysPerPdu) + 1;
                    const busways = Array.from(
                        { length: buswaysNeeded },
                        (_, k) => (startBusway + k - 1) % buswaysPerPdu + 1
                    );
                    buswayAssignments.push(`STS ${sts}: Busways ${busways} (${busways.length * buswayCapacity} kW)`);
                    buswaysUsed += buswaysNeeded;
                }

                schedule.push(`${startInterval.toLocaleTimeString([], formatter)} - ${endInterval.toLocaleTimeString([], formatter)}:`);
                schedule.push(...buswayAssignments);
                const totalLoad = buswaysUsed * buswayCapacity;
                schedule.push(`Total Load: ${totalLoad} kW`);
            }

            currentTime = new Date(currentTime.getTime() + (testDurationHrs + 1) * 60 * 60000);
            schedule.push(`Cooldown until: ${currentTime.toLocaleTimeString([], formatter)}`);
        }
    }
    return schedule;
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
