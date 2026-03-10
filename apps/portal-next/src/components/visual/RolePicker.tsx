"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./RolePicker.css";

type RoleId = "retail" | "erp" | "education" | "teacher" | "student" | "home" | "partner" | "ngo" | "ecom";

export default function RolePicker({ dict, locale }: { dict: any, locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [primaryRole, setPrimaryRole] = useState<RoleId | null>(null);
  const [secondaryRoles, setSecondaryRoles] = useState<Set<RoleId>>(new Set());
  const router = useRouter();

  useEffect(() => {
    (window as any).dispatchRolePicker = () => {
      setIsOpen(true);
    };
    return () => {
      delete (window as any).dispatchRolePicker;
    };
  }, []);

  // Update body overflow when picker is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setPrimaryRole(null);
      setSecondaryRoles(new Set());
    }, 500);
  };

  const toggleRole = (role: RoleId) => {
    if (!primaryRole) {
      setPrimaryRole(role);
    } else if (primaryRole === role) {
      setPrimaryRole(null);
      setSecondaryRoles(new Set());
    } else {
      const newSec = new Set(secondaryRoles);
      if (newSec.has(role)) {
        newSec.delete(role);
      } else {
        newSec.add(role);
      }
      setSecondaryRoles(newSec);
    }
  };

  const getRoleClass = (role: RoleId) => {
    if (primaryRole === role) return "primary";
    if (secondaryRoles.has(role)) return "secondary";
    return "";
  };

  const handleEnterWorld = () => {
    if (primaryRole) {
      router.push(`/${locale}/${primaryRole}`);
      handleClose();
    }
  };

  const handleSkip = () => {
    router.push(`/${locale}/explore`);
    handleClose();
  };

  const summaryText = primaryRole 
    ? secondaryRoles.size > 0 
      ? `1 Primary · ${secondaryRoles.size} Secondary` 
      : "1 Primary Selected"
    : "";

  return (
    <div id="picker" className={isOpen ? "on" : ""}>
      <button className="pk-close" onClick={handleClose}>✕</button>
      <div className="pk-wrap">

        <div className="pk-steps">
          <span className={`pk-step ${primaryRole ? "done" : "act"}`}>01 {dict.steps.step1}</span>
          <div className="pk-sdiv"></div>
          <span className={`pk-step ${primaryRole && secondaryRoles.size === 0 ? "act" : primaryRole ? "done" : ""}`}>02 {dict.steps.step2}</span>
          <div className="pk-sdiv"></div>
          <span className={`pk-step ${primaryRole ? "act" : ""}`}>03 {dict.steps.step3}</span>
        </div>

        <div className="pk-head">{dict.head}</div>
        <p className="pk-sub">{dict.sub}</p>

        <div className="pk-grid">
          <RoleItem id="retail" colorId="retail" icon="🛍️" title={dict.roles.retail.title} desc={dict.roles.retail.desc} onClick={() => toggleRole("retail")} stateClass={getRoleClass("retail")} />
          <RoleItem id="erp" colorId="erp" icon="⚙️" title={dict.roles.erp.title} desc={dict.roles.erp.desc} onClick={() => toggleRole("erp")} stateClass={getRoleClass("erp")} />
          <RoleItem id="education" colorId="edu" icon="🏫" title={dict.roles.education.title} desc={dict.roles.education.desc} onClick={() => toggleRole("education")} stateClass={getRoleClass("education")} />
          <RoleItem id="teacher" colorId="teacher" icon="👨‍🏫" title={dict.roles.teacher.title} desc={dict.roles.teacher.desc} onClick={() => toggleRole("teacher")} stateClass={getRoleClass("teacher")} />
          <RoleItem id="student" colorId="student" icon="🎓" title={dict.roles.student.title} desc={dict.roles.student.desc} onClick={() => toggleRole("student")} stateClass={getRoleClass("student")} />
          <RoleItem id="home" colorId="home" icon="🏠" title={dict.roles.home.title} desc={dict.roles.home.desc} onClick={() => toggleRole("home")} stateClass={getRoleClass("home")} />
          <RoleItem id="partner" colorId="partner" icon="🤝" title={dict.roles.partner.title} desc={dict.roles.partner.desc} onClick={() => toggleRole("partner")} stateClass={getRoleClass("partner")} />
          <RoleItem id="ngo" colorId="ngo" icon="🤲" title={dict.roles.ngo.title} desc={dict.roles.ngo.desc} onClick={() => toggleRole("ngo")} stateClass={getRoleClass("ngo")} />
          <RoleItem id="ecom" colorId="ecom" icon="🛒" title={dict.roles.ecom.title} desc={dict.roles.ecom.desc} onClick={() => toggleRole("ecom")} stateClass={getRoleClass("ecom")} />
        </div>

        <div className="pk-hint">
          <div className="pk-hint-item h-pri">
            <div className="dot"></div>Primary
          </div>
          <div className="pk-hint-item h-sec">
            <div className="dot"></div>Also relevant
          </div>
        </div>

        <div className="pk-actions">
          <button className={`pk-go ${primaryRole ? "ready" : ""}`} onClick={handleEnterWorld}>
            <span>{dict.actions.enter} →</span>
          </button>
          <button className="pk-skip" onClick={handleSkip}>{dict.actions.skip}</button>
          <div className={`pk-summary ${summaryText ? "has" : ""}`}>{summaryText}</div>
        </div>

      </div>
    </div>
  );
}

function RoleItem({
  id, colorId, icon, title, desc, onClick, stateClass
}: {
  id: string, colorId: string, icon: string, title: string, desc: string, onClick: () => void, stateClass: string
}) {
  return (
    <div className={`pk-role ${stateClass}`} data-role={id} data-c={colorId} onClick={onClick}>
      <span className="pk-badge">{stateClass === "primary" ? "PRIMARY" : "ALSO"}</span>
      <span className="pk-r-ico">{icon}</span>
      <div className="pk-r-txt">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
}
