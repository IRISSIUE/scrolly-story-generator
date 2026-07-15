function createTimelineInHtml(
  timelineStart,
  timelineEnd,
  timelineTickInterval,
) {
  const timelineSection = document.getElementById("timeline");
  const startDate = parseTimelineDate(timelineStart);
  const endDate = parseTimelineDate(timelineEnd);
  const { tickInterval, tickUnit: intervalUnit } =
    extractTickIntervalAndUnit(timelineTickInterval);

  if (
    !validateTimelineInputs(
      timelineSection,
      startDate,
      endDate,
      tickInterval,
      intervalUnit,
    )
  ) {
    return;
  }

  timelineSection.removeAttribute("hidden");
  document.body.classList.add("has-fixed-timeline");

  const tickDates = buildTimelineTickDates(
    startDate,
    endDate,
    tickInterval,
    intervalUnit,
  );
  const totalRangeMs = endDate.getTime() - startDate.getTime();

  const displayYearsOnly = areAllDatesJanuaryFirst(tickDates);

  const ticksHtml = tickDates
    .map((tickDate) => {
      const leftPercentage =
        totalRangeMs === 0
          ? 0
          : ((tickDate.getTime() - startDate.getTime()) / totalRangeMs) * 100;
      return `<div class="timeline-tick" style="left: ${leftPercentage}%"><span class="timeline-tick-mark" aria-hidden="true"></span><span class="timeline-tick-label">${formatTimelineDate(tickDate, displayYearsOnly)}</span></div>`;
    })
    .join("");

  timelineSection.innerHTML = `
    <div class="timeline-container" aria-label="Timeline from ${formatTimelineDate(startDate, displayYearsOnly)} to ${formatTimelineDate(endDate, displayYearsOnly)}">
      <div class="timeline-track" aria-hidden="true"></div>
      ${ticksHtml}
    </div>
  `;
}

function areAllDatesJanuaryFirst(tickDates) {
  return tickDates.every(
    (date) =>
      date instanceof Date && date.getMonth() === 0 && date.getDate() === 1,
  );
}

function extractTickIntervalAndUnit(tickInterval) {
  let intervalValue = Number(tickInterval);
  let intervalUnit = "y";

  if (intervalValue > 0 && intervalValue != NaN) {
    return { tickInterval: intervalValue, tickUnit: intervalUnit };
  }

  const match = String(tickInterval).match(/^(\d+)([ymd])$/);
  if (!match) {
    return { tickInterval: NaN, tickUnit: null };
  }
  intervalValue = Number(match[1]);
  intervalUnit = match[2];
  return { tickInterval: intervalValue, tickUnit: intervalUnit };
}

function validateTimelineInputs(
  timelineHTMLSection,
  startDate,
  endDate,
  tickInterval,
  intervalUnit,
) {
  if (!timelineHTMLSection) {
    return false;
  }

  if (
    !startDate ||
    !endDate ||
    !Number.isInteger(tickInterval) ||
    tickInterval <= 0 ||
    startDate > endDate ||
    !["y", "m", "d"].includes(intervalUnit)
  ) {
    console.log(
      "Invalid or no timeline inputs specified. Timeline will not be displayed.",
    );
    console.log(
      "Start Date:",
      startDate,
      "End Date:",
      endDate,
      "Tick Interval:",
      tickInterval,
      "Tick Unit:",
      intervalUnit,
    );
    return false;
  }
  return true;
}

function parseTimelineDate(inputDate) {
  if (!inputDate) {
    return null;
  }
  const trimmedInputDate = inputDate.toString().trim();

  const yearOnlyMatch = trimmedInputDate.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1]);
    const parsedYearDate = new Date(year, 0, 1);
    return parsedYearDate;
  }

  const isoDateMatch = trimmedInputDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const year = Number(isoDateMatch[1]);
    const month = Number(isoDateMatch[2]);
    const day = Number(isoDateMatch[3]);
    const parsedDate = new Date(year, month - 1, day);
    return parsedDate;
  }

  const parsedDate = new Date(trimmedInputDate);
  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function buildTimelineTickDates(
  startDate,
  endDate,
  tickInterval,
  intervalUnit,
) {
  const tickDates = [startDate];

  let nextTickDate = new Date(startDate);
  while (true) {
    nextTickDate = new Date(nextTickDate);

    if (intervalUnit === "y") {
      nextTickDate.setFullYear(nextTickDate.getFullYear() + tickInterval);
    } else if (intervalUnit === "m") {
      nextTickDate.setMonth(nextTickDate.getMonth() + tickInterval);
    } else if (intervalUnit === "d") {
      nextTickDate.setDate(nextTickDate.getDate() + tickInterval);
    }

    if (nextTickDate >= endDate) {
      break;
    }

    tickDates.push(new Date(nextTickDate));
  }

  const lastTick = tickDates[tickDates.length - 1];
  if (lastTick.getTime() !== endDate.getTime()) {
    tickDates.push(endDate);
  }
  return tickDates;
}

function formatTimelineDate(date, displayYearsOnly = false) {
  if (displayYearsOnly) {
    return date.getFullYear().toString();
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export { createTimelineInHtml };
