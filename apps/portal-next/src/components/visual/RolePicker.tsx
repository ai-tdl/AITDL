"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./RolePicker.css";

type RoleId = "retail" | "erp" | "education" | "teacher" | "student" | "home" | "partner" | "ngo" | "ecom";

export default function RolePicker() {
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
      // Unset primary, maybe promote a secondary to primary? Or just clear all.
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
      router.push(`/${primaryRole}`);
      handleClose();
    }
  };

  const handleSkip = () => {
    router.push('/explore');
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
          <span className={`pk-step ${primaryRole ? "done" : "act"}`}>01 Pick Primary</span>
          <div className="pk-sdiv"></div>
          <span className={`pk-step ${primaryRole && secondaryRoles.size === 0 ? "act" : primaryRole ? "done" : ""}`}>02 Add More</span>
          <div className="pk-sdiv"></div>
          <span className={`pk-step ${primaryRole ? "act" : ""}`}>03 Enter</span>
        </div>

        <div className="pk-head">Who Are You?</div>
        <p className="pk-sub">Pick your <em>primary role</em> — then optionally add more. We'll show only what's relevant to you.</p>

        <div className="pk-grid">
          <RoleItem id="retail" colorId="retail" icon="🛍️" title="Retailer" desc="Shop / chain / mall owner" onClick={() => toggleRole("retail")} stateClass={getRoleClass("retail")} />
          <RoleItem id="erp" colorId="erp" icon="⚙️" title="Business" desc="ERP / Tally / accounts" onClick={() => toggleRole("erp")} stateClass={getRoleClass("erp")} />
          <RoleItem id="education" colorId="edu" icon="🏫" title="School" desc="School / coaching institute" onClick={() => toggleRole("education")} stateClass={getRoleClass("education")} />
          <RoleItem id="teacher" colorId="teacher" icon="👨‍🏫" title="Teacher" desc="AI tools for educators" onClick={() => toggleRole("teacher")} stateClass={getRoleClass("teacher")} />
          <RoleItem id="student" colorId="student" icon="🎓" title="Student" desc="AI-powered learning" onClick={() => toggleRole("student")} stateClass={getRoleClass("student")} />
          <RoleItem id="home" colorId="home" icon="🏠" title="Parent" desc="Home & family AI tools" onClick={() => toggleRole("home")} stateClass={getRoleClass("home")} />
          <RoleItem id="partner" colorId="partner" icon="🤝" title="Partner" desc="Resell AITDL products" onClick={() => toggleRole("partner")} stateClass={getRoleClass("partner")} />
          <RoleItem id="ngo" colorId="ngo" icon="🤲" title="NGO / Trust" desc="Social sector software" onClick={() => toggleRole("ngo")} stateClass={getRoleClass("ngo")} />
          <RoleItem id="ecom" colorId="ecom" icon="🛒" title="Ecommerce" desc="Sell online — India-first" onClick={() => toggleRole("ecom")} stateClass={getRoleClass("ecom")} />
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
            <span>Enter My World →</span>
          </button>
          <button className="pk-skip" onClick={handleSkip}>Show everything instead</button>
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
