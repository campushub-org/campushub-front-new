import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TimeTablePDF = () => {

  const coverRef = useRef(null);
  const timetableRef = useRef(null);



  // =========================================
  // DATA
  // =========================================

  const emploi = {
    academicYear: "2025 - 2026",
    semester: "2",
    startDate: "09 MARS",
    month: "Mars 2026",
    facultyFr: "FACULTE DES SCIENCES",
    facultyEn: "FACULTY OF SCIENCE"
  };



  // =========================================
  // GENERATE PDF
  // =========================================

  const exportPDF = async () => {

    try {

      if (!coverRef.current || !timetableRef.current) {
        alert("Erreur : pages introuvables");
        return;
      }

      // =====================================
      // PDF : PREMIERE PAGE EN PAYSAGE
      // =====================================

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });



      // =====================================
      // PAGE 1 : COVER
      // =====================================

      const coverCanvas = await html2canvas(
        coverRef.current,
        {
          scale: 2,
          useCORS: true
        }
      );

      const coverImg = coverCanvas.toDataURL("image/png");



      // A4 paysage = 297 x 210

      pdf.addImage(
        coverImg,
        "PNG",
        0,
        0,
        297,
        210
      );



      // =====================================
      // PAGE 2 : PORTRAIT
      // =====================================

      pdf.addPage("a4", "portrait");



      const timetableCanvas = await html2canvas(
        timetableRef.current,
        {
          scale: 2,
          useCORS: true
        }
      );

      const timetableImg =
        timetableCanvas.toDataURL("image/png");



      // A4 portrait = 210 x 297

      pdf.addImage(
        timetableImg,
        "PNG",
        0,
        0,
        210,
        297
      );



      pdf.save("emploi_du_temps.pdf");

    } catch (error) {

      console.error(error);

      alert("Erreur lors de la génération du PDF");

    }
  };



  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "40px",
        fontFamily: "Arial, sans-serif"
      }}
    >



      {/* ========================================= */}
      {/* APP HEADER */}
      {/* ========================================= */}

      <div
        style={{
          background: "white",
          borderRadius: "18px",
          padding: "25px 35px",
          marginBottom: "40px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <div>

          <h1
            style={{
              margin: 0,
              fontSize: "40px",
              color: "#0f172a"
            }}
          >
            Générateur d'emploi du temps
          </h1>

          <p
            style={{
              marginTop: "8px",
              fontSize: "20px",
              color: "#64748b"
            }}
          >
            Export PDF multi-pages
          </p>

        </div>





        <button
          onClick={exportPDF}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "16px 28px",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(37,99,235,0.25)"
          }}
        >
          Exporter PDF
        </button>

      </div>







      {/* ========================================= */}
      {/* PREVIEW */}
      {/* ========================================= */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "50px",
          alignItems: "center"
        }}
      >







        {/* ===================================== */}
        {/* COVER PAGE */}
        {/* ===================================== */}

        <div
          ref={coverRef}
          style={{
            width: "100%",
            height: "1123px",
            background: "#e9e9e9",
            position: "relative",
            padding: "55px 65px",
            boxSizing: "border-box",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)"
          }}
        >

          {/* ================= TOP HEADER ================= */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              textAlign: "center"
            }}
          >

            {/* LEFT */}
            <div
              style={{
                width: "32%"
              }}
            >

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  lineHeight: 1.3
                }}
              >
                UNIVERSITE DE YAOUNDE 1
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  marginTop: "5px"
                }}
              >
                {emploi.facultyFr}
              </div>

              <div
                style={{
                  marginTop: "45px",
                  fontSize: "18px",
                  fontWeight: "700",
                  lineHeight: 1.4
                }}
              >
                Division de la Programmation et du suivi
                des Activités Académiques
              </div>

            </div>





            {/* LOGO */}
            <div>

              <img
                src="/logoUY1-rmbg.png"
                alt="logo"
                style={{
                  width: "320px",
                  height: "255px",
                  objectFit: "contain"
                }}
              />

            </div>





            {/* RIGHT */}
            <div
              style={{
                width: "32%"
              }}
            >

              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  lineHeight: 1.3
                }}
              >
                THE UNIVERSITY OF YAOUNDE 1
              </div>

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  marginTop: "5px"
                }}
              >
                {emploi.facultyEn}
              </div>

              <div
                style={{
                  marginTop: "45px",
                  fontSize: "18px",
                  fontWeight: "700",
                  lineHeight: 1.4
                }}
              >
                Division of Programming and academic
                activities follow up
              </div>

            </div>

          </div>






          {/* ================= YEAR SECTION ================= */}

          <div
            style={{
              marginTop: "110px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start"
            }}
          >

            {/* LEFT */}
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                lineHeight: 1.3
              }}
            >

              <div
                style={{
                  fontSize: "22px"
                }}
              >
                ANNEE ACADEMIQUE
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "22px"
                }}
              >
                {emploi.academicYear}
              </div>

              <div
                style={{
                  fontSize: "22px"
                }}
              >
                SEMESTRE {emploi.semester}
              </div>

            </div>





            {/* RIGHT */}
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                lineHeight: 1.3
              }}
            >

              <div
                style={{
                  fontSize: "22px"
                }}
              >
                {emploi.academicYear}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "22px"
                }}
              >
                ACADEMIC YEAR
              </div>

              <div
                style={{
                  fontSize: "22px"
                }}
              >
                2nd SEMESTER
              </div>

            </div>

          </div>







          {/* ================= MAIN TITLE ================= */}

          <div
            style={{
              marginTop: "150px",
              textAlign: "center"
            }}
          >

            <div
              style={{
                fontSize: "72px",
                fontWeight: "900",
                color: "#0066ff",
                textTransform: "uppercase",
                letterSpacing: "2px",
                WebkitTextStroke: "2px #d10000",
                lineHeight: 1
              }}
            >
              EMPLOI DU TEMPS - TIME TABLE
            </div>

          </div>








          {/* ================= START DATE ================= */}

          <div
            style={{
              marginTop: "120px",
              textAlign: "center"
            }}
          >

            <div
              style={{
                fontSize: "100px",
                fontWeight: "900",
                color: "#efefef",
                WebkitTextStroke: "1.8px #222",
                textTransform: "uppercase",
                lineHeight: 1
              }}
            >
              DEBUT DES COURS : {emploi.startDate}
            </div>

          </div>








          {/* ================= MONTH ================= */}

          <div
            style={{
              marginTop: "35px",
              textAlign: "right",
              paddingRight: "40px",
              fontSize: "28px",
              fontWeight: "900"
            }}
          >
            {emploi.month}
          </div>









          {/* ================= FOOTER ================= */}

          <div
            style={{
              position: "absolute",
              bottom: "65px",
              left: "65px",
              right: "65px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end"
            }}
          >

            {/* LEFT */}
            <div
              style={{
                fontSize: "16px",
                fontWeight: "700",
                lineHeight: 1.4
              }}
            >
              <div>UNIVERSITE DE YAOUNDE 1</div>
              <div>{emploi.facultyFr}</div>
            </div>





            {/* RIGHT */}
            <div
              style={{
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "700",
                lineHeight: 1.4
              }}
            >
              <div>UNIVERSITY OF YAOUNDE 1</div>
              <div>{emploi.facultyEn}</div>
            </div>





            {/* PAGE NUMBER */}
            <div
              style={{
                fontSize: "20px"
              }}
            >
              1
            </div>

          </div>

        </div>



        {/* ===================================== */}
        {/* PAGE 2 */}
        {/* ===================================== */}

        <div
          ref={timetableRef}
          style={{
            width: "794px",
            height: "1123px",
            background: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >

          <div
            style={{
              textAlign: "center"
            }}
          >

            <h1
              style={{
                fontSize: "54px",
                color: "#0f172a",
                marginBottom: "20px"
              }}
            >
              Bienvenu sur mon emploi de temps
            </h1>

            <p
              style={{
                fontSize: "24px",
                color: "#64748b"
              }}
            >
              Le contenu de l'emploi du temps commencera ici.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default TimeTablePDF;