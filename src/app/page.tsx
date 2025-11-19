import { DateTime } from "luxon";

interface UptimeRobotResponse {
  nextLink: string | null;
  data: Monitor[];
}
interface Monitor {
  id: number;
  type: string;
  friendlyName: string;
  domainExpireDate: string | null;
}
function isDateWithin(date: string | null, day: number): boolean {
  if (!date) return false;
  const targetDate = DateTime.fromISO(date);
  const currentDate = DateTime.now();
  const diffInDays = targetDate.diff(currentDate, "days").days;
  return diffInDays <= day;
}

function compareDates(a: Monitor, b: Monitor): number {
  if (a.domainExpireDate === null) return 1;
  if (b.domainExpireDate === null) return -1;
  if (a.domainExpireDate && b.domainExpireDate) {
    return (
      new Date(a.domainExpireDate).getTime() -
      new Date(b.domainExpireDate).getTime()
    );
  }
  return 0;
}
export default async function Home() {
  const uptimeKey = process.env.UP_TIME_ROBOT_API_KEY;
  const fetchResponse = await fetch("https://api.uptimerobot.com/v3/monitors", {
    headers: {
      Authorization: `Bearer ${uptimeKey}`,
    },
    cache: "no-store",
  });
  const response: UptimeRobotResponse = await fetchResponse.json();

  return (
    <div className="home">
      <h1>Domain Expiration Dates</h1>
      {response.nextLink && <p>Paging Required!! More than 1 page.</p>}
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {response.data
            .filter((monitor) => monitor.type === "HTTP")
            .sort(compareDates)
            .map((monitor) => (
              <tr key={monitor.id}>
                <td>{monitor.friendlyName.replace(/^www\./, "")}</td>
                <td
                  className={
                    isDateWithin(monitor.domainExpireDate, 30) ? "expiring" : ""
                  }
                >
                  {monitor.domainExpireDate
                    ? DateTime.fromISO(
                        monitor.domainExpireDate as string,
                      ).toFormat("yyyy-MM-dd")
                    : "-"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <p>
        <a
          href="https://stats.uptimerobot.com/Dtk7adRGdf"
          target="_blank"
          rel="noreferrer"
        >
          Uptime
        </a>
      </p>
    </div>
  );
}
