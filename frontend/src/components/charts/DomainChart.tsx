import { FC } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import twColorsPlugin from "chartjs-plugin-tailwindcss-colors";
import tailwindConfig from "@/../tailwind.config";
import { ResultDataDTO } from "@/types/dtos";
import { Card } from "@nextui-org/react";

ChartJS.register(
  twColorsPlugin(tailwindConfig),
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface DomainChartProps {
  data: ResultDataDTO;
  isMobile: boolean;
  theme: string;
  DOMAIN_LABELS: Record<string, string>;
}

const DomainChart: FC<DomainChartProps> = ({ data, isMobile, theme, DOMAIN_LABELS }) => {
  const domainLabels = Object.keys(data.domains).map(key => DOMAIN_LABELS[key]);
  const domainScores = Object.values(data.domains).map(domain => domain.score);

  if (data.total != null) {
    domainLabels.push("Total");
    domainScores.push(data.total);
  }

  return (
    <Card className="w-full bg-transparent p-4 flex flex-col items-start overflow-hidden">
      <div className="w-full h-auto" style={{ marginBottom: isMobile ? "0px" : "-100px" }}>
        <Bar
          id="domain-chart"
          data={{
            labels: domainLabels,
            datasets: [
              {
                label: "Score",
                data: domainScores,
                backgroundColor: "#6C5CE7",
                hoverBackgroundColor: "#5547C0",
                barPercentage: 0.6,
              },
            ],
          }}
          options={{
            responsive: true,
            indexAxis: isMobile ? "x" : "y",
            layout: {
              padding: {
                bottom: isMobile ? 0 : 100,
              },
            },
            plugins: {
              datalabels: {
                color: theme === "light" ? "#2C2C34" : "#E0E0E0",
                anchor: "end",
                align: "end",
                font: { family: "'Inter', sans-serif" },
              },
              legend: { display: false },
              tooltip: {
                titleColor: theme === "light" ? "#2C2C34" : "#FFFFFF",
                bodyColor: theme === "light" ? "#2C2C34" : "#FFFFFF",
                backgroundColor: theme === "light" ? "#FFFFFF" : "#2A2A2F",
                displayColors: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  color: theme === "light" ? "#2C2C34" : "#E0E0E0",
                  font: { family: "'Inter', sans-serif" },
                },
                grid: {
                  display: false,
                },
                border: {
                  display: false,
                },
              },
              x: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  color: theme === "light" ? "#2C2C34" : "#E0E0E0",
                  font: { family: "'Inter', sans-serif" },
                },
                grid: {
                  display: false,
                },
                border: {
                  color: theme === "light" ? "#2C2C34" : "#E0E0E0",
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
};

export default DomainChart;
