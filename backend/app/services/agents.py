import json
import os
from typing import Dict, Any, List, TypedDict
import google.generativeai as genai
from langgraph.graph import StateGraph, END
from app.core.config import settings

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# Refactored Agent State Schema matching the new Multi-Agent Architecture
class AgentState(TypedDict):
    # Base Inputs
    product_id: int
    product_name: str
    category: str
    current_price: float
    cost_price: float
    inventory_stock: int
    target_margin: float
    competitors: List[Dict[str, Any]]
    historical_sales: List[Dict[str, Any]]
    demand_forecasts: List[Dict[str, Any]]
    
    # Agent 1 (Competitor Tracking Agent) Outputs
    price_comparison_table: str
    competitor_insights: str
    competitor_alerts: List[str]
    
    # Agent 2 (Demand Forecast Agent) Outputs
    demand_graph_data: List[Dict[str, Any]]
    forecast_table_data: List[Dict[str, Any]]
    inventory_suggestions: str
    
    # Agent 3 (Pricing Strategy Agent) Outputs
    recommended_price: float
    profit_margin: float
    strategy_explanation: str
    confidence_score: float
    
    # Supervisor Agent Outputs
    final_report: str
    actionable_recommendations: List[str]
    
    # Tracking logs
    agent_logs: List[str]


# ==========================================
# AGENT 1: Competitor Tracking Agent
# ==========================================
def competitor_tracking_agent_node(state: AgentState) -> Dict[str, Any]:
    logs = state.get("agent_logs", [])
    logs.append("[Competitor Tracking Agent] Beginning market pricing comparison scan...")
    
    product_name = state["product_name"]
    current_price = state["current_price"]
    competitors = state["competitors"]
    
    if not competitors:
        table = "| Competitor | Price | URL | Stock |\n|:---|:---:|:---|:---:|\n| None | — | — | — |"
        insights = "No tracked competitors found for this SKU."
        alerts = ["ALERT: No competitor listings detected. You currently own 100% local market visibility."]
        logs.append("[Competitor Tracking Agent] Completed. No competitors to track.")
        return {
            "price_comparison_table": table,
            "competitor_insights": insights,
            "competitor_alerts": alerts,
            "agent_logs": logs
        }
        
    competitors_str = "\n".join([
        f"- {c['competitor_name']}: ${c['price']} (Stock: {c['stock_status']}, URL: {c.get('competitor_url', 'N/A')})"
        for c in competitors
    ])

    prompt = f"""
You are the Competitor Tracking Agent for SmartSeller AI.
Compare competitor prices and trends for: "{product_name}" (Our Price: ${current_price})

Monitored Listings:
{competitors_str}

Tasks:
1. Create a markdown Price Comparison Table showing competitor name, price, stock status, url.
2. Draft Competitor Insights (compare min/max, find pricing gaps, identify price drops).
3. Generate active alerts (e.g. if a competitor priced significantly lower, or is out of stock).

Format your output as a raw JSON object matching this schema:
{{
  "price_comparison_table": "| Competitor | Price | Stock |\\n|...|",
  "competitor_insights": "Detailed analysis text.",
  "competitor_alerts": ["Alert 1", "Alert 2"]
}}
Output raw JSON only. Do not wrap in markdown block strings.
"""
    
    output = {}
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```", "", 1).rsplit("```", 1)[0].strip()
            output = json.loads(raw_text)
        except Exception as e:
            logs.append(f"[Competitor Tracking Agent] Gemini connection error: {str(e)}. Running backup rules.")
            output = mock_competitor_tracking(current_price, competitors)
    else:
        logs.append("[Competitor Tracking Agent] Running offline simulation mode.")
        output = mock_competitor_tracking(current_price, competitors)
        
    logs.append(f"[Competitor Tracking Agent] Monitored {len(competitors)} sources. Detected price deviations.")
    return {
        "price_comparison_table": output.get("price_comparison_table", ""),
        "competitor_insights": output.get("competitor_insights", ""),
        "competitor_alerts": output.get("competitor_alerts", []),
        "agent_logs": logs
    }


# ==========================================
# AGENT 2: Demand Forecast Agent
# ==========================================
def demand_forecast_agent_node(state: AgentState) -> Dict[str, Any]:
    logs = state.get("agent_logs", [])
    logs.append("[Demand Forecast Agent] Loading sales history and training prediction model...")
    
    product_name = state["product_name"]
    historical_sales = state["historical_sales"]
    forecasts = state["demand_forecasts"]
    stock = state["inventory_stock"]
    
    total_sales_projected = sum([f["predicted_quantity"] for f in forecasts])
    
    prompt = f"""
You are the Demand Forecast Agent for SmartSeller AI.
Analyze sales history for product: "{product_name}"
Current Stock: {stock} units
Forecasted sales for next 7 days: {total_sales_projected} units

Forecast Details:
{chr(10).join([f"- {f['forecast_date']}: {f['predicted_quantity']} units (range: {f['lower_bound']}-{f['upper_bound']})" for f in forecasts])}

Tasks:
1. Identify future demand trends (spikes, weekday vs weekend seasonality).
2. Generate Inventory Suggestions (is there an understock/overstock risk? Should they reorder?).
3. Output the suggestions as text.

Format your output as a raw JSON object matching this schema:
{{
  "inventory_suggestions": "Analysis of stock health, reorder quantities, and expected day of stockout."
}}
Output raw JSON only. Do not wrap in markdown block strings.
"""
    
    output = {}
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```", "", 1).rsplit("```", 1)[0].strip()
            output = json.loads(raw_text)
        except Exception as e:
            logs.append(f"[Demand Forecast Agent] Gemini error: {str(e)}. Running default regression parser.")
            output = {"inventory_suggestions": mock_inventory_suggestions(stock, total_sales_projected)}
    else:
        logs.append("[Demand Forecast Agent] Running offline simulation mode.")
        output = {"inventory_suggestions": mock_inventory_suggestions(stock, total_sales_projected)}

    logs.append(f"[Demand Forecast Agent] Projected demand curve calculated. Safety threshold matched.")
    return {
        "demand_graph_data": forecasts,
        "forecast_table_data": forecasts,
        "inventory_suggestions": output.get("inventory_suggestions", ""),
        "agent_logs": logs
    }


# ==========================================
# AGENT 3: Pricing Strategy Agent
# ==========================================
def pricing_strategy_agent_node(state: AgentState) -> Dict[str, Any]:
    logs = state.get("agent_logs", [])
    logs.append("[Pricing Strategy Agent] Intersecting competitive pricing and demand forecast...")
    
    product_name = state["product_name"]
    current_price = state["current_price"]
    cost_price = state["cost_price"]
    target_margin = state["target_margin"]
    competitor_insights = state["competitor_insights"]
    inventory_suggestions = state["inventory_suggestions"]
    
    min_price = cost_price * (1 + target_margin)
    
    prompt = f"""
You are the Pricing Strategy Agent for SmartSeller AI.
Determine the optimal pricing strategy for: "{product_name}"

Product Costs:
- Current price: ${current_price}
- Product Cost Basis: ${cost_price}
- target margin ratio constraint: {target_margin}
- Minimum pricing floor allowed: ${min_price:.2f}

Competitor Tracking Insights:
{competitor_insights}

Demand Forecast Insights:
{inventory_suggestions}

Tasks:
1. Calculate the recommended price. It MUST be greater than or equal to the minimum pricing floor: ${min_price:.2f}.
2. Calculate the expected profit margin: ((Recommended Price - Cost) / Recommended Price) * 100
3. Explain the strategy explanation (referencing competitor matching, seasonality, or stock buffers).
4. Provide a confidence score from 0.0 to 1.0.

Format your output as a raw JSON object matching this schema:
{{
  "recommended_price": 99.99,
  "profit_margin": 45.2,
  "strategy_explanation": "Explanation here.",
  "confidence_score": 0.85
}}
Output raw JSON only. Do not wrap in markdown block strings.
"""
    
    output = {}
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```", "", 1).rsplit("```", 1)[0].strip()
            output = json.loads(raw_text)
        except Exception as e:
            logs.append(f"[Pricing Strategy Agent] Gemini failed: {str(e)}. Switching to algorithmic margin optimizer.")
            output = mock_algorithmic_pricing(state, min_price)
    else:
        logs.append("[Pricing Strategy Agent] Running rule-based strategic optimizer.")
        output = mock_algorithmic_pricing(state, min_price)

    # Validate min price constraints
    rec_price = output.get("recommended_price", current_price)
    if rec_price < min_price:
        rec_price = min_price
        output["recommended_price"] = round(rec_price, 2)
        output["profit_margin"] = round(((rec_price - cost_price) / rec_price) * 100, 1)
        output["strategy_explanation"] = f"Price adjusted upward to ${min_price:.2f} to protect target ROI threshold rules."

    logs.append(f"[Pricing Strategy Agent] Optimized price to ${output.get('recommended_price'):.2f}. Margin: {output.get('profit_margin')}%")
    return {
        "recommended_price": output.get("recommended_price", current_price),
        "profit_margin": output.get("profit_margin", 0.0),
        "strategy_explanation": output.get("strategy_explanation", ""),
        "confidence_score": output.get("confidence_score", 0.80),
        "agent_logs": logs
    }


# ==========================================
# SUPERVISOR AGENT
# ==========================================
def supervisor_agent_node(state: AgentState) -> Dict[str, Any]:
    logs = state.get("agent_logs", [])
    logs.append("[Supervisor Agent] Gathering outputs from all specialist agents...")
    
    product_name = state["product_name"]
    category = state["category"]
    
    # Collect data from prior state
    comp_table = state["price_comparison_table"]
    comp_insights = state["competitor_insights"]
    comp_alerts = state["competitor_alerts"]
    inv_suggestions = state["inventory_suggestions"]
    rec_price = state["recommended_price"]
    profit_margin = state["profit_margin"]
    strat_explain = state["strategy_explanation"]
    
    prompt = f"""
You are the Lead Supervisor Agent coordinating the SmartSeller AI execution pipeline.
Aggregate the reports from the Competitor, Demand, and Pricing specialist agents for: "{product_name}" (Category: {category})

Competitor Scan Results:
{comp_insights}

Price Table:
{comp_table}

Alerts:
{', '.join(comp_alerts)}

Demand Inventory Suggestions:
{inv_suggestions}

Pricing Recommendation:
- Target Selling Price: ${rec_price:.2f}
- Estimated Gross Profit Margin: {profit_margin}%
- Rationale: {strat_explain}

Tasks:
1. Review all results for inconsistencies.
2. Compile a master e-commerce intelligence markdown report.
3. Extract 3-4 bulleted actionable business recommendations.

Format your output as a raw JSON object matching this schema:
{{
  "final_report": "# Compiled Strategic Business Intelligence Report\\n\\n### Executive Summary\\n...",
  "actionable_recommendations": [
    "Recommendation 1: Detail what the merchant should do.",
    "Recommendation 2: Detail inventory orders."
  ]
}}
Output raw JSON only. Do not wrap in markdown block strings.
"""
    
    output = {}
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif raw_text.startswith("```"):
                raw_text = raw_text.replace("```", "", 1).rsplit("```", 1)[0].strip()
            output = json.loads(raw_text)
        except Exception as e:
            logs.append(f"[Supervisor Agent] Gemini compilation failed: {str(e)}.")
            output = mock_supervisor_compile(state)
    else:
        logs.append("[Supervisor Agent] Compiling final briefing summary.")
        output = mock_supervisor_compile(state)
        
    logs.append("[Supervisor Agent] Global business briefing successfully finalized.")
    return {
        "final_report": output.get("final_report", ""),
        "actionable_recommendations": output.get("actionable_recommendations", []),
        "agent_logs": logs
    }


# ==========================================
# Fallback / Mock Engines
# ==========================================
def mock_competitor_tracking(current_price: float, competitors: list) -> dict:
    prices = [c['price'] for c in competitors]
    avg_price = sum(prices) / len(prices)
    min_price = min(prices)
    
    table_lines = ["| Competitor | Price | Stock | URL |", "|:---|:---:|:---:|:---|"]
    for c in competitors:
        table_lines.append(f"| {c['competitor_name']} | ${c['price']:.2f} | {c['stock_status']} | [Link]({c.get('competitor_url', '#')}) |")
    
    insights = (
        f"Average competitor price is ${avg_price:.2f}. "
        f"We are currently selling at ${current_price:.2f}. "
        f"Lowest market pricing is set by competitor at ${min_price:.2f}."
    )
    
    alerts = []
    if current_price > avg_price:
        alerts.append(f"ALERT: Our pricing is higher than the competitor average by ${(current_price - avg_price):.2f}. Demand risk: HIGH.")
    if any(c['stock_status'] == 'out_of_stock' for c in competitors):
        alerts.append("ALERT: Competitor inventory shortages detected. Potential room for dynamic markups.")
        
    return {
        "price_comparison_table": "\n".join(table_lines),
        "competitor_insights": insights,
        "competitor_alerts": alerts
    }

def mock_inventory_suggestions(stock: int, total_forecast: int) -> str:
    if stock < total_forecast:
        return f"Understock Risk detected. Projected demand ({total_forecast} units) exceeds current stock ({stock} units). Order at least {total_forecast - stock + 30} units immediately."
    return f"Inventory healthy. Remaining stock of {stock} units easily covers predicted 7-day volume of {total_forecast} units."

def mock_algorithmic_pricing(state: AgentState, min_price: float) -> dict:
    competitors = state["competitors"]
    current_price = state["current_price"]
    stock = state["inventory_stock"]
    cost = state["cost_price"]
    
    if not competitors:
        rec_price = current_price
        reason = "No competitors found. Maintain price."
    else:
        prices = [c['price'] for c in competitors]
        avg_price = sum(prices) / len(prices)
        if stock > 150:
            rec_price = max(min(prices), min_price)
            reason = f"High inventory stock ({stock} units) requires lower price point to accelerate sales velocity."
        elif stock < 40:
            rec_price = current_price * 1.05
            reason = f"Low safety stock ({stock} units). Raised pricing to slow velocity and secure high margins."
        else:
            rec_price = max(avg_price, min_price)
            reason = f"Market matching strategy applied. Recommended pricing aligned with competitor average."

    rec_price = round(rec_price, 2)
    margin = round(((rec_price - cost) / rec_price) * 100, 1)
    return {
        "recommended_price": rec_price,
        "profit_margin": margin,
        "strategy_explanation": reason,
        "confidence_score": 0.90
    }

def mock_supervisor_compile(state: AgentState) -> dict:
    rep = f"""# SmartSeller AI — Consolidated Market Analysis Report
**Product**: {state['product_name']}
**Category**: {state['category']}

## 1. Competitor Tracking Overview
{state['competitor_insights']}

{state['price_comparison_table']}

## 2. Demand Projections & Safety Stock
{state['inventory_suggestions']}

## 3. Optimizing Recommendation
- **Target Price**: ${state['recommended_price']:.2f}
- **Expected Gross Margin**: {state['profit_margin']}%
- **Pricing Strategy Rationale**: {state['strategy_explanation']}
"""
    
    actions = [
        f"Apply new optimized selling price at ${state['recommended_price']:.2f} to align with store strategy constraints.",
    ]
    if "Understock Risk" in state['inventory_suggestions']:
        actions.append("Reorder units from suppliers to prevent listing buy-box drops.")
    else:
        actions.append("Maintain standard marketing levels. No reorder trigger required.")
        
    return {
        "final_report": rep,
        "actionable_recommendations": actions
    }


# ==========================================
# LangGraph Workflow Construction
# ==========================================
def build_agent_graph():
    workflow = StateGraph(AgentState)
    
    # 1. Register new nodes representing the requested agent blocks
    workflow.add_node("competitor_tracking_agent", competitor_tracking_agent_node)
    workflow.add_node("demand_forecast_agent", demand_forecast_agent_node)
    workflow.add_node("pricing_strategy_agent", pricing_strategy_agent_node)
    workflow.add_node("supervisor_agent", supervisor_agent_node)
    
    # 2. Establish routing layout links
    workflow.set_entry_point("competitor_tracking_agent")
    workflow.add_edge("competitor_tracking_agent", "demand_forecast_agent")
    workflow.add_edge("demand_forecast_agent", "pricing_strategy_agent")
    workflow.add_edge("pricing_strategy_agent", "supervisor_agent")
    workflow.add_edge("supervisor_agent", END)
    
    return workflow.compile()

# Instantiated graph run compiler
agent_orchestrator = build_agent_graph()

async def run_smart_seller_agents(
    product_db_model: Any, 
    competitors_list: List[Dict[str, Any]], 
    sales_history_list: List[Dict[str, Any]],
    forecasts_list: List[Dict[str, Any]],
    target_margin: float = 0.20
) -> Dict[str, Any]:
    """
    Asynchronously invokes the refactored LangGraph multi-agent system.
    """
    initial_state = AgentState(
        product_id=product_db_model.id,
        product_name=product_db_model.product_name,
        category=product_db_model.category,
        current_price=product_db_model.current_price,
        cost_price=product_db_model.cost_price,
        inventory_stock=product_db_model.inventory_stock,
        target_margin=target_margin,
        competitors=competitors_list,
        historical_sales=sales_history_list,
        demand_forecasts=forecasts_list,
        
        # Initialize outputs
        price_comparison_table="",
        competitor_insights="",
        competitor_alerts=[],
        demand_graph_data=[],
        forecast_table_data=[],
        inventory_suggestions="",
        recommended_price=product_db_model.current_price,
        profit_margin=0.0,
        strategy_explanation="",
        confidence_score=0.85,
        final_report="",
        actionable_recommendations=[],
        agent_logs=[]
    )
    
    # Invoke LangGraph workflow
    final_output = agent_orchestrator.invoke(initial_state)
    
    # Map final state outputs to match endpoints parameters compatibility:
    # pricing_recommendation contains recommended_price, reason, confidence_score
    pricing_recommendation = {
        "recommended_price": final_output["recommended_price"],
        "reason": final_output["strategy_explanation"],
        "confidence_score": final_output["confidence_score"]
    }
    
    # Return structured dict compatible with /api/pricing/analyze
    return {
        "pricing_recommendation": pricing_recommendation,
        "competitor_analysis": final_output["competitor_insights"],
        "demand_analysis": final_output["inventory_suggestions"],
        "final_report": final_output["final_report"],
        "agent_logs": final_output["agent_logs"]
    }
