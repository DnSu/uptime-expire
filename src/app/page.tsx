import React from "react";
// import Axios from "axios";
// import { setupCache } from "axios-cache-interceptor";
import { DateTime } from "luxon";
import Link from "next/link";
import axios from "axios";

interface Monitor {
  id: number;
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
  // const instance = Axios.create();
  // const axios = setupCache(instance);
  const response = await axios.get<{
    nextLink: string | null;
    data: Monitor[];
  }>("https://api.uptimerobot.com/v3/monitors", {
    headers: {
      Authorization: `Bearer ${uptimeKey}`,
    },
  });

  return (
    <div className="home">
      {response.data.nextLink && <p>Paging Required!! More than 1 page.</p>}
      <p>
        <Link href="https://stats.uptimerobot.com/Dtk7adRGdf">Uptime</Link>
      </p>
      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {response.data.data
            .filter((monitor) => monitor.domainExpireDate !== null)
            .sort(compareDates)
            .map((monitor) => (
              <tr key={monitor.id}>
                <td>{monitor.friendlyName.replace(/^www\./, "")}</td>
                <td
                  className={
                    isDateWithin(monitor.domainExpireDate, 30) ? "expiring" : ""
                  }
                >
                  {DateTime.fromISO(
                    monitor.domainExpireDate as string,
                  ).toFormat("yyyy-MM-dd")}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
