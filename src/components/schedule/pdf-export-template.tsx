
import React from "react";
import { ScheduleEvent, SchedulePlan } from "@/lib/schedule-data";

export const ACADEMIC_SLOTS = [
    { label: "7h - 9h55",      start: 7,  end: 10 },
    { label: "10h05 - 12h55",  start: 10, end: 13 },
    { label: "13h05 - 15h55",  start: 13, end: 16 },
    { label: "16h05 - 18h55",  start: 16, end: 19 },
    { label: "19h05 - 21h55",  start: 19, end: 22 },
];

const DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function getSlotIndex(startTime: string): number {
    const [h] = startTime.split(":").map(Number);
    if (h < 10) return 0;
    if (h < 13) return 1;
    if (h < 16) return 2;
    if (h < 19) return 3;
    return 4;
}

const FONT = "'Arial', 'Helvetica', sans-serif";
const THICK = "2px solid #000";
const THIN  = "1px solid #000";

export interface CoverPageProps {
    plan: SchedulePlan;
    logoSrc?: string;
    facultyFr?: string;
    facultyEn?: string;
}

export const CoverPage = React.forwardRef<HTMLDivElement, CoverPageProps>(
    (
        {
            plan,
            logoSrc = "/logoUY1-rmbg.png",
            facultyFr = "FACULTE DES SCIENCES",
            facultyEn = "FACULTY OF SCIENCE",
        },
        ref
    ) => {
        const startYear = plan.startDate
            ? new Date(plan.startDate).getFullYear()
            : new Date().getFullYear();
        const academicYear  = `${startYear} - ${startYear + 1}`;
        const semNum        = String(plan.semester ?? "2");
        const semEn         = semNum === "1" ? "1st" : semNum === "2" ? "2nd" : `${semNum}th`;

        const startDateFmt = plan.startDate
            ? new Date(plan.startDate)
                .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                .toUpperCase()
            : "";

        const monthFmt = plan.startDate
            ? new Date(plan.startDate)
                .toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                .toUpperCase()
            : "";

        return (
            <div
                ref={ref}
                style={{
                width: "794px",
                height: "1123px",
                background: "#e4e4e4",
                position: "relative",
                padding: "52px 62px",
                boxSizing: "border-box",
                fontFamily: FONT,
                overflow: "hidden",
                }}
            >
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "8px",
                    background: "linear-gradient(90deg, #002fa7 0%, #0054d6 50%, #002fa7 100%)",
                }} />
                <div style={{
                    position: "absolute", top: "8px", left: 0, right: 0, height: "3px",
                    background: "#d10000",
                }} />

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    textAlign: "center",
                    marginTop: "10px",
                }}>
                    <div style={{ width: "31%", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            UNIVERSITE DE YAOUNDE 1
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "22px", fontWeight: "900", textTransform: "uppercase" }}>
                            {facultyFr}
                        </p>
                        <p style={{ margin: "40px 0 0", fontSize: "15px", fontWeight: "700", lineHeight: 1.4 }}>
                            Division de la Programmation<br />et du suivi des Activités<br />Académiques
                        </p>
                    </div>

                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                            src={logoSrc}
                            alt="Logo UY1"
                            style={{ width: "240px", height: "190px", objectFit: "contain" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>

                    <div style={{ width: "31%", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            THE UNIVERSITY OF YAOUNDE 1
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "22px", fontWeight: "900", textTransform: "uppercase" }}>
                            {facultyEn}
                        </p>
                        <p style={{ margin: "40px 0 0", fontSize: "15px", fontWeight: "700", lineHeight: 1.4 }}>
                            Division of Programming<br />and academic activities<br />follow up
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: "28px", height: "2px", background: "#000" }} />

                <div style={{
                    marginTop: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}>
                    <div style={{ textAlign: "center", fontWeight: "900", lineHeight: 1.35 }}>
                        <p style={{ margin: 0, fontSize: "20px" }}>ANNEE ACADEMIQUE</p>
                        <p style={{ margin: "6px 0 0", fontSize: "22px" }}>{academicYear}</p>
                        <p style={{ margin: 0, fontSize: "20px" }}>SEMESTRE {semNum}</p>
                    </div>
                    <div style={{ textAlign: "center", fontWeight: "900", lineHeight: 1.35 }}>
                        <p style={{ margin: 0, fontSize: "20px" }}>{academicYear}</p>
                        <p style={{ margin: "6px 0 0", fontSize: "22px" }}>ACADEMIC YEAR</p>
                        <p style={{ margin: 0, fontSize: "20px" }}>{semEn} SEMESTER</p>
                    </div>
                </div>

                <div style={{ marginTop: "100px", textAlign: "center" }}>
                    <p style={{
                        margin: 0,
                        fontSize: "78px",
                        fontWeight: "900",
                        color: "#0047cc",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                        WebkitTextStroke: "2px #cc0000",
                        lineHeight: 1.05,
                    }}>
                        EMPLOI DU TEMPS
                    </p>
                    <p style={{
                        margin: "6px 0 0",
                        fontSize: "52px",
                        fontWeight: "900",
                        color: "#0047cc",
                        letterSpacing: "2px",
                        WebkitTextStroke: "1.5px #cc0000",
                    }}>
                        TIME TABLE
                    </p>
                </div>

                <div style={{ marginTop: "80px", textAlign: "center" }}>
                    <p style={{
                        margin: 0,
                        fontSize: "42px",
                        fontWeight: "900",
                        color: "#e4e4e4",
                        WebkitTextStroke: "1.5px #222",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        lineHeight: 1,
                    }}>
                        DEBUT DES COURS : {startDateFmt}
                    </p>
                </div>

                <div style={{
                    marginTop: "28px",
                    textAlign: "right",
                    paddingRight: "32px",
                    fontSize: "24px",
                    fontWeight: "900",
                    letterSpacing: "1px",
                }}>
                    {monthFmt}
                </div>

                <div style={{
                    position: "absolute", bottom: "56px", left: 0, right: 0, height: "3px",
                    background: "#d10000",
                }} />
                    <div style={{
                        position: "absolute", bottom: "47px", left: 0, right: 0, height: "8px",
                        background: "linear-gradient(90deg, #002fa7 0%, #0054d6 50%, #002fa7 100%)",
                    }} />

                    <div style={{
                        position: "absolute",
                        bottom: "14px",
                        left: "62px",
                        right: "62px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", lineHeight: 1.4 }}>
                        <p style={{ margin: 0 }}>UNIVERSITE DE YAOUNDE 1</p>
                        <p style={{ margin: 0 }}>{facultyFr}</p>
                    </div>
                    <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", lineHeight: 1.4 }}>
                        <p style={{ margin: 0 }}>UNIVERSITY OF YAOUNDE 1</p>
                        <p style={{ margin: 0 }}>{facultyEn}</p>
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "700" }}>1</div>
                </div>
            </div>
        );
    }
);
CoverPage.displayName = "CoverPage";



export interface TimetablePageProps {
    events: ScheduleEvent[];
    plan: SchedulePlan;
    facultyFr?: string;
    facultyEn?: string;
    footerNotes?: string;
}

export const TimetablePage = React.forwardRef<HTMLDivElement, TimetablePageProps>(
    (
        {
            events,
            plan,
            facultyFr = "FACULTE DES SCIENCES",
            facultyEn = "FACULTY OF SCIENCE",
            footerNotes,
        },
        ref
    ) => {
        const startYear    = plan.startDate ? new Date(plan.startDate).getFullYear() : new Date().getFullYear();
        const academicYear = `${startYear} – ${startYear + 1}`;
        const semNum       = String(plan.semester ?? "2");
        const semEn        = semNum === "1" ? "1st" : semNum === "2" ? "2nd" : `${semNum}th`;
        const levelLabel   = (plan.name || plan.level || "").toUpperCase();

        const grid: ScheduleEvent[][][] = Array.from({ length: 5 }, () =>
            Array.from({ length: 7 }, () => [])
        );
        events.forEach((ev) => {
            const s = getSlotIndex(ev.startTime);
            const d = ev.day;
            if (s >= 0 && s < 5 && d >= 0 && d < 7) {
                grid[s][d].push(ev);
            }
        });

        const ROW_H = 160;

        const cellBase: React.CSSProperties = {
            border: THIN,
            padding: "5px 6px",
            verticalAlign: "top",
            fontSize: "11px",
            fontFamily: FONT,
            lineHeight: 1.35,
            textAlign: "center",
        };

        const renderCell = (slotEvents: ScheduleEvent[]) =>
            slotEvents.map((ev, idx) => {
                const code = ev.subjectCode ?? ev.title ?? "";
                const profs = ev.professor
                ? ev.professor
                    .split(/[,/]/)
                    .map((p) => p.trim().toUpperCase())
                    .filter(Boolean)
                : [];

            return (
                <div
                    key={ev.id}
                    style={{
                    borderTop: idx > 0 ? THIN : "none",
                    paddingTop: idx > 0 ? "5px" : "0",
                    marginTop: idx > 0 ? "5px" : "0",
                    }}
                >
                    <p style={{ margin: 0, fontWeight: "900", fontSize: "11px", lineHeight: 1.2 }}>
                        {code}
                    </p>
                    {ev.room && (
                        <p style={{ margin: "2px 0 0", fontWeight: "700", fontSize: "11px" }}>
                            {ev.room}
                        </p>
                    )}
                    {profs.length > 0 && (
                        <p style={{ margin: "3px 0 0", fontStyle: "italic", fontSize: "10px", lineHeight: 1.3 }}>
                            {profs.map((p, i) => (
                                <React.Fragment key={i}>
                                    {p}/{i < profs.length - 1 ? <br /> : ""}
                                </React.Fragment>
                            ))}
                        </p>
                    )}
                </div>
            );
        });

        return (
            <div
                ref={ref}
                style={{
                width: "794px",
                height: "1123px",
                background: "#fff",
                position: "relative",
                padding: "18px 22px",
                boxSizing: "border-box",
                fontFamily: FONT,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                }}
            >
                <div style={{ marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: "900", fontSize: "13px", textDecoration: "underline", textTransform: "uppercase" }}>
                                UNIVERSITE DE YAOUNDE 1
                            </p>
                            <p style={{ margin: "2px 0 0", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>
                                {facultyFr}
                            </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontWeight: "900", fontSize: "13px", textDecoration: "underline", textTransform: "uppercase" }}>
                                UNIVERSITY OF YAOUNDE 1
                            </p>
                            <p style={{ margin: "2px 0 0", fontWeight: "900", fontSize: "14px", textTransform: "uppercase" }}>
                                {facultyEn}
                            </p>
                        </div>
                    </div>

                    <p style={{ margin: "4px 0 0", fontSize: "10px", fontWeight: "600", textAlign: "center", lineHeight: 1.3 }}>
                        Division de la Programmation et du suivi des Activités Académiques
                        {"     "}Division of Programming and academic activities follow up.
                    </p>

                    <p style={{ margin: "5px 0 0", fontWeight: "900", fontSize: "14px", textAlign: "center", letterSpacing: "0.5px" }}>
                        EMPLOI DU TEMPS : TIME TABLE
                    </p>

                    <p style={{ margin: "3px 0 0", fontWeight: "700", fontSize: "12px", textAlign: "center" }}>
                        SEMESTRE____
                        <span style={{ fontWeight: "900" }}>{semNum}</span>
                        ____ANNEE ACADEMIQUE{" "}
                        <span style={{ fontWeight: "900" }}>{academicYear}</span>
                        {" "}ACADEMIC YEAR____
                        <span style={{ fontWeight: "900" }}>{semNum}</span>
                        ____
                        <span style={{ fontWeight: "900" }}>{semEn}</span>
                        {" "}SEMESTER
                    </p>

                    <p style={{ margin: "5px 0 0", fontWeight: "900", fontSize: "18px", textAlign: "center", letterSpacing: "1px" }}>
                        {levelLabel}
                    </p>
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: THICK,
                        tableLayout: "fixed",
                        flex: 1,
                    }}
                >
                    <colgroup>
                        <col style={{ width: "9%" }} />
                        {DAYS_FR.map((_, i) => (
                            <col key={i} style={{ width: `${91 / 7}%` }} />
                        ))}
                    </colgroup>

                    <thead>
                        <tr style={{ background: "#f5f5f5" }}>
                            <th style={{ ...cellBase, fontWeight: "900", fontSize: "12px", border: THICK, padding: "8px 4px" }}>
                                Heures
                            </th>
                            {DAYS_FR.map((day) => (
                                <th key={day} style={{ ...cellBase, fontWeight: "900", fontSize: "12px", border: THIN, padding: "8px 4px", textAlign: "center" }}>
                                {day}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {ACADEMIC_SLOTS.map((slot, sIdx) => (
                            <tr key={sIdx}>
                                <td
                                    style={{
                                        ...cellBase,
                                        border: THICK,
                                        fontWeight: "700",
                                        fontSize: "10px",
                                        verticalAlign: "middle",
                                        textAlign: "center",
                                        height: `${ROW_H}px`,
                                        padding: "4px 3px",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {slot.label}
                                </td>

                                {DAYS_FR.map((_, dIdx) => {
                                    const cellEvents = grid[sIdx][dIdx];
                                    return (
                                        <td
                                            key={dIdx}
                                            style={{
                                                ...cellBase,
                                                height: `${ROW_H}px`,
                                                verticalAlign: cellEvents.length > 0 ? "top" : "middle",
                                            }}
                                        >
                                            {renderCell(cellEvents)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {footerNotes && (
                    <div style={{ marginTop: "6px", borderTop: THICK, paddingTop: "4px", textAlign: "center" }}>
                        <p style={{ margin: 0, fontWeight: "900", fontSize: "13px" }}>{footerNotes}</p>
                    </div>
                )}

                <div style={{
                    marginTop: "auto",
                    paddingTop: "6px",
                    borderTop: THICK,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", lineHeight: 1.4 }}>
                        <p style={{ margin: 0 }}>UNIVERSITE DE YAOUNDE 1</p>
                        <p style={{ margin: 0 }}>{facultyFr}</p>
                        <p style={{ margin: "2px 0 0", fontWeight: "500", fontSize: "9px" }}>
                            Division de la Programmation et du suivi des Activités Académiques
                        </p>
                    </div>
                    <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", lineHeight: 1.4 }}>
                        <p style={{ margin: 0 }}>UNIVERSITY OF YAOUNDE 1</p>
                        <p style={{ margin: 0 }}>{facultyEn}</p>
                        <p style={{ margin: "2px 0 0", fontWeight: "500", fontSize: "9px" }}>
                            Division of Programming and academic activities follow up.
                        </p>
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "700" }}>2</div>
                </div>
            </div>
        );
    }
);
TimetablePage.displayName = "TimetablePage";