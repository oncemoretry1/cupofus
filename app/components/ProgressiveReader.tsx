"use client";

import { ReactNode, useEffect, useState } from "react";

export type ReaderStep = {
  id: string;
  label: string;
  content: ReactNode;
};

type ProgressiveReaderProps = {
  title: string;
  eyebrow: string;
  steps: ReaderStep[];
  actions: ReactNode;
};

export function ProgressiveReader({ title, eyebrow, steps, actions }: ProgressiveReaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
      if (event.key === "ArrowLeft") setCurrentStep((value) => Math.max(value - 1, 0));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [steps.length]);

  const goTo = (index: number) => {
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <aside className="reader-directory">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <div className="read-progress" aria-label={`อ่านแล้ว ${currentStep + 1} จาก ${steps.length} ตอน`}>
          <i style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="cup-line-label"><span>●</span><b>CUP LINE</b><small>เลือกสถานีเพื่อข้ามไปอ่าน</small></div>
        <nav className="cup-line" aria-label="เส้นทางบทอ่าน">
          {steps.map((item, index) => (
            <button
              className={index === currentStep ? "is-active" : index < currentStep ? "is-read" : ""}
              key={item.id}
              onClick={() => goTo(index)}
              aria-current={index === currentStep ? "step" : undefined}
            >
              <span><i></i>0{index + 1}</span><b>{item.label}</b>
            </button>
          ))}
        </nav>
        <div className="directory-actions">{actions}</div>
      </aside>

      <article className="reader-story" aria-live="polite">
        <div className="reader-story-progress">
          <span>ตอนที่ {String(currentStep + 1).padStart(2, "0")}</span>
          <span>{String(steps.length).padStart(2, "0")}</span>
        </div>
        <section className="reader-story-stage" key={step.id} id={step.id}>
          {step.content}
        </section>
        <footer className="reader-story-controls">
          <button onClick={() => goTo(currentStep - 1)} disabled={isFirst} aria-label="ย้อนกลับไปสถานีก่อนหน้า">
            <span>←</span><b>ย้อนกลับ<small>{isFirst ? "ต้นทาง" : steps[currentStep - 1].label}</small></b>
          </button>
          <p><b>{String(currentStep + 1).padStart(2,"0")}</b><span>/</span>{String(steps.length).padStart(2,"0")}</p>
          <button className="reader-forward" onClick={() => goTo(currentStep + 1)} disabled={isLast} aria-label="ไปสถานีถัดไป">
            <b>{isLast ? "อ่านครบแล้ว" : "อ่านต่อ"}<small>{isLast ? "ถึงปลายทาง" : steps[currentStep + 1].label}</small></b><span>→</span>
          </button>
        </footer>
      </article>
    </>
  );
}
