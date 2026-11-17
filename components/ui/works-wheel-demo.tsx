"use client";

import WorksWheel from "./works-wheel";
import { works } from "@/lib/data/works";

export default function WorksWheelDemo() {
  return (
    <WorksWheel
      items={works}
      label="creations"
      action="View"
    />
  );
}