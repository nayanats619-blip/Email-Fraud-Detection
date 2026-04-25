// Fraud Detection Algorithm

const fraudKeywords = [
  "verify account",
  "confirm identity",
  "update payment",
  "urgent action required",
  "click here",
  "act now",
  "limited time",
  "congratulations",
  "claim prize",
  "winner",
  "reset password",
  "suspend account",
  "unusual activity",
  "immediate action",
  "unauthorized access",
  "re-activate",
  "expire",
  "validate",
  "confirm",
  "approve",
  "transfer money",
  "bank details",
  "credit card",
  "social security",
  "personal information",
  "refund",
  "tax return",
  "inheritance",
  "wealthy",
  "lottery",
];

const suspiciousKeywords = [
  "please",
  "important",
  "notification",
  "account",
  "update",
  "information",
  "request",
  "review",
  "check",
  "details",
];

const commonFraudDomains = [
  "mail.com",
  "mailbox.com",
  "yandex.com",
  "guerrillamail.com",
];

const legitimateDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "company.com",
  "work.com",
  "edu",
  "gov",
];

function analyzeFraud(senderEmail, emailText) {
  let riskScore = 0;
  const reasons = [];
  const detectedKeywords = [];

  // 1. Check sender email domain
  const emailDomain = senderEmail.split("@")[1]?.toLowerCase() || "";
  
  if (commonFraudDomains.includes(emailDomain)) {
    riskScore += 25;
    reasons.push("⚠️ Suspicious email domain detected");
  } else if (!legitimateDomains.some(domain => emailDomain.includes(domain))) {
    riskScore += 15;
    reasons.push("⚠️ Unusual email domain");
  }

  // 2. Check sender email format
  if (senderEmail.length > 50 || !senderEmail.includes("@")) {
    riskScore += 20;
    reasons.push("❌ Invalid email format");
  }

  // 3. Analyze email text for fraud keywords
  const lowerEmailText = emailText.toLowerCase();
  
  fraudKeywords.forEach(keyword => {
    const count = (lowerEmailText.match(new RegExp(keyword, "gi")) || []).length;
    if (count > 0) {
      riskScore += count * 8;
      detectedKeywords.push(keyword);
    }
  });

  // 4. Check for suspicious keywords
  suspiciousKeywords.forEach(keyword => {
    const count = (lowerEmailText.match(new RegExp(keyword, "gi")) || []).length;
    if (count > 2) {
      riskScore += count * 3;
      detectedKeywords.push(keyword);
    }
  });

  // 5. Check for excessive capitalization
  const upperCaseRatio = (lowerEmailText.match(/[A-Z]/g) || []).length / emailText.length;
  if (upperCaseRatio > 0.3) {
    riskScore += 15;
    reasons.push("⚠️ Excessive capitalization detected");
  }

  // 6. Check for urgency indicators
  if (lowerEmailText.match(/urgent|asap|immediately|now|within \d+ hours/gi)) {
    riskScore += 15;
    reasons.push("⚠️ High urgency language detected");
  }

  // 7. Check for numbers and special characters density
  const specialCharRatio = (emailText.match(/[!@#$%^&*()_+=\-\[\]{};:'",.<>?/\\|`~]/g) || []).length / emailText.length;
  if (specialCharRatio > 0.15) {
    riskScore += 10;
    reasons.push("⚠️ High special character density");
  }

  // 8. Email length analysis
  if (emailText.length < 50) {
    riskScore += 5;
    reasons.push("⚠️ Very short email");
  }

  // 9. Check for phishing indicators
  if (lowerEmailText.match(/click|link|http|download|attachment/gi)) {
    const count = (lowerEmailText.match(/click|link|http|download|attachment/gi) || []).length;
    riskScore += count * 5;
    reasons.push(`⚠️ Contains ${count} action trigger word(s)`);
  }

  // 10. Check for personal info requests
  if (lowerEmailText.match(/password|pin|credit card|bank|routing number|ssn|social security/gi)) {
    riskScore += 30;
    reasons.push("🚫 Requests for personal/financial information detected");
  }

  // Determine status based on score
  let status = "Safe";
  if (riskScore >= 70) {
    status = "Fraud";
  } else if (riskScore >= 40) {
    status = "Suspicious";
  }

  // Add general reasons
  if (status === "Safe" && reasons.length === 0) {
    reasons.push("✅ Email appears legitimate");
  }

  // Add keyword information
  if (detectedKeywords.length > 0) {
    reasons.push(`🔍 Detected keywords: ${[...new Set(detectedKeywords)].join(", ")}`);
  }

  // Cap the score at 100
  riskScore = Math.min(riskScore, 100);

  return {
    status,
    riskScore: Math.round(riskScore),
    reasons,
    keywords: [...new Set(detectedKeywords)],
  };
}

module.exports = { analyzeFraud };
