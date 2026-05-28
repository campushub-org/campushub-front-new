
import { useCallback, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { ScheduleEvent, SchedulePlan } from "@/lib/schedule-data";

interface UsePdfExportOptions {
    plans: SchedulePlan[];
    selectedPlanId: string;
    events: ScheduleEvent[];
    facultyFr?: string;
    facultyEn?: string;
}

export function usePdfExport({
    plans,
    selectedPlanId,
    events,
    facultyFr = "FACULTE DES SCIENCES",
    facultyEn = "FACULTY OF SCIENCE",
}: UsePdfExportOptions) {
    const coverRef    = useRef<HTMLDivElement>(null);
    const timetableRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const captureElement = async (el: HTMLDivElement): Promise<string> => {
        const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: el.offsetWidth,
            height: el.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            logging: false,
        });
        return canvas.toDataURL("image/png");
    };

    const exportToPDF = useCallback(async () => {
        const plan = plans.find((p) => p.id === selectedPlanId);
        if (!plan) {
            toast.error("Aucune programmation sélectionnée");
            return;
        }
        if (!coverRef.current || !timetableRef.current) {
            toast.error("Composants de rendu introuvables");
            return;
        }

        setIsExporting(true);
        toast.info("Génération du PDF…");

        await new Promise((r) => setTimeout(r, 300));

        try {
            const coverImg = await captureElement(coverRef.current);

            const timetableImg = await captureElement(timetableRef.current);

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const PW = pdf.internal.pageSize.getWidth();
            const PH = pdf.internal.pageSize.getHeight();

            pdf.addImage(coverImg, "PNG", 0, 0, PW, PH);

            pdf.addPage();
            pdf.addImage(timetableImg, "PNG", 0, 0, PW, PH);

            const fileName = `${(plan.name || "emploi_du_temps").replace(/\s+/g, "_")}.pdf`;
            pdf.save(fileName);

            toast.success("PDF généré avec succès !");
        } catch (err) {
            console.error("[usePdfExport] Erreur :", err);
            toast.error("Échec de la génération du PDF");
        } finally {
            setIsExporting(false);
        }
    }, [plans, selectedPlanId, events]);

    return { coverRef, timetableRef, isExporting, exportToPDF };
}