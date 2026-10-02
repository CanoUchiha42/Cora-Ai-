const test=require("node:test");const assert=require("node:assert/strict");global.window=global;global.crypto=require("node:crypto").webcrypto;require("../js/config.js");require("../js/demo-data.js");require("../js/qualification.js");
test("SHK and company size are extracted",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Wir sind ein SHK-Betrieb mit 20 Mitarbeitern.");assert.equal(s.industry,"Handwerk / SHK");assert.equal(s.companySize,20)});
test("website inquiries are remembered",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Wir bekommen 40 Website-Anfragen im Monat.");assert.equal(s.monthlyWebsiteInquiries,40);CoraQualification.update(s,"Wir wollen mehr qualifizierte Heizungsanfragen.");assert.equal(s.monthlyWebsiteInquiries,40);assert.equal(s.service,"heizung");assert.equal(s.goal,"Mehr qualifizierte Anfragen")});
test("ROI inputs are extracted",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"40 Anfragen, Abschlussquote 20 %, durchschnittlicher Auftragswert 5000 €.");assert.equal(s.monthlyWebsiteInquiries,40);assert.equal(s.conversionRate,20);assert.equal(s.averageOrderValue,5000)});
test("package and purchase intent",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Wir haben 40 Website-Anfragen und möchten Cora Pro buchen.");assert.equal(s.recommendedPackage,"Pro");assert.equal(s.purchaseIntent,"hoch");assert.equal(s.conversationStage,"HIGH_INTENT")});
test("kanzlei detection",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Ich habe eine Kanzlei. Wie kann Cora helfen?");assert.equal(s.industry,"Kanzlei")});
test("industry scoring prefers the most specific match",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Wir betreiben ein Hotel mit Restaurant und bieten Übernachtungen an.");assert.equal(s.industry,"Restaurant / Hotel")});
test("next best question uses industry context",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Ich bin Immobilienmakler und möchte mehr Anfragen. Wir bekommen 30 Website-Anfragen.");assert.match(s.nextBestQuestion,/Kauf|Miete/i)});
test("high intent is preserved across follow-up",()=>{const s=CoraQualification.empty();CoraQualification.update(s,"Ich möchte ein Angebot für Cora starten.");assert.equal(s.purchaseIntent,"hoch");CoraQualification.update(s,"Wir bekommen 30 Website-Anfragen.");assert.equal(s.purchaseIntent,"hoch")});
test("price and ROI state can coexist without losing context",()=>{
 const s=CoraQualification.empty();
 CoraQualification.update(s,"Wir sind ein SHK-Betrieb mit 20 Mitarbeitern und 40 Website-Anfragen.");
 CoraQualification.update(s,"Unsere Abschlussquote liegt bei 20 % und der durchschnittliche Auftragswert bei 5000 €. Lohnt sich Cora Pro?");
 assert.equal(s.industry,"Handwerk / SHK");
 assert.equal(s.companySize,20);
 assert.equal(s.monthlyWebsiteInquiries,40);
 assert.equal(s.conversionRate,20);
 assert.equal(s.averageOrderValue,5000);
 assert.equal(s.goal,"Wirtschaftlichkeit prüfen");
});
test("context is not erased by a follow-up without new values",()=>{
 const s=CoraQualification.empty();
 CoraQualification.update(s,"Ich habe ein Fitnessstudio und 60 Website-Anfragen im Monat.");
 CoraQualification.update(s,"Was kostet Pro?");
 assert.equal(s.industry,"Fitnessstudio");
 assert.equal(s.monthlyWebsiteInquiries,60);
 assert.equal(s.recommendedPackage,"Pro");
});
