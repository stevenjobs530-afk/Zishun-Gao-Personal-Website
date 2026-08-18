import { ArrowLeft } from "lucide-react";
import styles from "./portfolio-back-link.module.css";

type PortfolioBackLinkProps = {
  href: string;
  language: "en" | "zh";
  ariaLabel: string;
};

export default function PortfolioBackLink({ href, language, ariaLabel }: PortfolioBackLinkProps) {
  const label = language === "zh" ? "返回作品集" : "Back to Portfolio";

  return (
    <a className={styles.link} href={href} aria-label={ariaLabel} data-portfolio-back-link>
      <ArrowLeft aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
