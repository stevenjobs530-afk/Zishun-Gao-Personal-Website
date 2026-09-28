import { aepResearchContent } from "./case-studies/early-career-wellbeing/aep-research-content";

// Every page is exported as static English HTML and switches to Chinese after
// hydration. This inline script runs before first paint for ?lang=zh so the
// document language, tab title and description are already Chinese; the page
// components still own the visible copy. Keep these strings in sync with each
// page's own zh documentTitle / description.
const chineseDocumentMeta: Record<string, { title: string; description: string }> = {
  "": {
    title: "高子舜 — 个人作品集",
    description: "高子舜的个人作品集，聚焦金融、经济、风险管理、数据分析、应用研究与负责任的 AI 辅助工作流。",
  },
  "case-studies/uk-retail": {
    title: "英国零售交易分析 — 高子舜",
    description: "一个使用 SQL 与 Python 构建的可追溯英国零售数据清洗与分析案例。",
  },
  "case-studies/apple-app-store": {
    title: "Apple App Store 数据分析 — 高子舜",
    description: "一个聚焦数据质量、可追溯处理与谨慎解读的 App Store 数据案例。",
  },
  "case-studies/early-career-wellbeing": {
    title: `${aepResearchContent.zh.title} — 高子舜`,
    description: aepResearchContent.zh.description,
  },
  "case-studies/ai-assisted-job-workflow": {
    title: "AI 辅助求职工作流概念 — 高子舜",
    description: "这套流程使用 AI 辅助发现、核验、比较和跟踪初级职业机会；个人决定、账户变更与申请仍由人工完成。",
  },
  "personal-projects/personal-training": {
    title: "个人训练记录 — 高子舜",
    description: "一个用于记录力量训练、有氧训练和休息日的个人全栈项目。",
  },
};

// Routes are matched by path suffix so the same script works with and without
// the GitHub Pages base path. The homepage is the fallback for a path of at
// most one segment (the base path itself); other unknown paths are left alone.
export const LANGUAGE_BOOTSTRAP = `(function(){try{
if(new URLSearchParams(location.search).get("lang")!=="zh")return;
document.documentElement.lang="zh-CN";
var meta=${JSON.stringify(chineseDocumentMeta)};
var path=location.pathname.replace(/\\/index\\.html$/,"").replace(/\\/+$/,"");
var key=Object.keys(meta).filter(function(k){return k&&path.slice(-k.length-1)==="/"+k;})[0];
if(!key){if(path.split("/").length>2)return;key="";}
var entry=meta[key];
var apply=function(){document.title=entry.title;var d=document.querySelector('meta[name="description"]');if(d)d.setAttribute("content",entry.description);};
apply();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});
}catch(e){}})();`;
