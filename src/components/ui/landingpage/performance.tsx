import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Stats8Props {
  heading?: string;
  description?: string;
  link?: {
    text: string;
    url: string;
  };
  stats?: Array<{
    id: string;
    value: string;
    label: string;
  }>;
}

// Helper for animated counter
function CountUp({ end, duration = 2000, format }: { end: string, duration?: number, format?: (n: number) => string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start = 0;
    let endNum = parseFloat(end.replace(/[^\d.]/g, ""));
    let isPercent = end.includes("%");
    let isPlus = end.includes("+");
    let isM = end.toLowerCase().includes("m");
    let isK = end.toLowerCase().includes("k");
    let suffix = isPercent ? "%" : isM ? "M" : isK ? "K" : isPlus ? "+" : "";
    let frame: number;
    let startTime: number | null = null;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      let current = start + (endNum - start) * progress;
      setValue(current);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setValue(endNum);
      }
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  let display = format ? format(value) : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  // Add suffix if needed
  if (end.includes("%")) display += "%";
  if (end.includes("+")) display += "+";
  if (end.toLowerCase().includes("m")) display += "M";
  if (end.toLowerCase().includes("k")) display += "K";
  return <span ref={ref}>{display}</span>;
}

const Stats8 = ({
  heading = "Platform performance insights",
  description = "Ensuring stability and scalability for all users",
  link = {
    text: "Read the full impact report",
    url: "https://www.shadcnblocks.com",
  },
  stats = [
    {
      id: "stat-1",
      value: "250%+",
      label: "average growth in user engagement",
    },
    {
      id: "stat-2",
      value: "$2.5m",
      label: "annual savings per enterprise partner",
    },
    {
      id: "stat-3",
      value: "200+",
      label: "integrations with top industry platforms",
    },
    {
      id: "stat-4",
      value: "99.9%",
      label: "customer satisfaction over the last year",
    },
  ],
}: Stats8Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold md:text-4xl">{heading}</h2>
          <p>{description}</p>
          <a
            href={link.url}
            className="flex items-center gap-1 font-bold hover:underline"
          >
            {link.text}
            <ArrowRight className="h-auto w-4" />
          </a>
        </div>
        <div className="mt-14 grid gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col gap-5">
              <div className="text-6xl font-bold">
                <CountUp end={stat.value} />
              </div>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Stats8 };
