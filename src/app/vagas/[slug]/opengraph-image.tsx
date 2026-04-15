import { ImageResponse } from "next/og";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  BRAND_LABELS,
  CONTRACT_TYPE_LABELS,
  WORK_MODEL_LABELS,
} from "@/lib/constants";
import type { Brand, ContractType, WorkModel } from "@/types";

export const runtime = "edge";
export const alt = "Vaga no Welcome Group";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_COLORS: Record<Brand, string> = {
  welcome_trips: "#0091B3",
  welcome_weddings: "#C4A882",
  welconnect: "#5B9A6B",
  corporativo: "#1A1A2E",
};

interface Props {
  params: { slug: string };
}

export default async function OG({ params }: Props) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("jobs")
    .select("title, brand, location, contract_type, work_model")
    .eq("slug", params.slug)
    .single();

  const title = (data?.title as string) ?? "Oportunidade no Welcome Group";
  const brand = (data?.brand as Brand) ?? "corporativo";
  const location = (data?.location as string) ?? "";
  const contractType = data?.contract_type as ContractType | undefined;
  const workModel = data?.work_model as WorkModel | undefined;
  const brandColor = BRAND_COLORS[brand];

  const meta: string[] = [];
  if (location) meta.push(location);
  if (contractType) meta.push(CONTRACT_TYPE_LABELS[contractType]);
  if (workModel) meta.push(WORK_MODEL_LABELS[workModel]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#F8F7F4",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow decorativo */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "#E6F5F9",
            display: "flex",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              padding: "6px 16px",
              background: brandColor,
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              borderRadius: 9999,
              display: "flex",
            }}
          >
            {BRAND_LABELS[brand]}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#0091B3",
              display: "flex",
            }}
          >
            Carreiras
          </div>
        </div>

        {/* Título */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            zIndex: 1,
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#0D5257",
              letterSpacing: -1,
              display: "flex",
            }}
          >
            {title}
          </div>
          {meta.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 20,
                fontSize: 26,
                color: "#4A4540",
                fontWeight: 500,
              }}
            >
              {meta.join("  ·  ")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0D5257",
              display: "flex",
            }}
          >
            Welcome{" "}
            <span style={{ color: "#0091B3", marginLeft: 10 }}>Carreiras</span>
          </div>
          <div
            style={{
              padding: "14px 28px",
              background: "#EA7600",
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              borderRadius: 6,
              display: "flex",
            }}
          >
            Candidate-se
          </div>
        </div>
      </div>
    ),
    size
  );
}
