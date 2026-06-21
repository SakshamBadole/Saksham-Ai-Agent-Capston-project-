import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from sklearn.linear_model import Ridge
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def train_and_forecast(sales_data: List[Dict[str, Any]], days_to_forecast: int = 7) -> List[Dict[str, Any]]:
    """
    Trains a Ridge Regression model on historical sales data and forecasts future sales.
    
    sales_data is a list of dicts: [{'date': date_obj, 'quantity_sold': int}]
    """
    if len(sales_data) < 14:
        # Fallback to simple average forecast if there is insufficient historical data
        avg_sales = np.mean([s['quantity_sold'] for s in sales_data]) if sales_data else 5
        forecasts = []
        for i in range(1, days_to_forecast + 1):
            f_date = date.today() + timedelta(days=i)
            forecasts.append({
                "forecast_date": f_date,
                "predicted_quantity": max(int(avg_sales), 0),
                "lower_bound": max(int(avg_sales * 0.7), 0),
                "upper_bound": int(avg_sales * 1.3)
            })
        return forecasts

    # Load sales data into DataFrame
    df = pd.DataFrame(sales_data)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)

    # Feature Engineering
    df['day_of_week'] = df['date'].dt.dayofweek.astype(str)
    df['day_of_month'] = df['date'].dt.day
    df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)
    
    # Target variable
    y = df['quantity_sold'].values
    
    # Feature matrix (X)
    X = df[['day_of_week', 'day_of_month', 'is_weekend']]

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['day_of_week']),
            ('num', 'passthrough', ['day_of_month', 'is_weekend'])
        ])

    # Build model pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', Ridge(alpha=1.0))
    ])

    # Fit the model
    model.fit(X, y)

    # Predict training set to compute standard deviation of residuals for confidence bounds
    y_pred_train = model.predict(X)
    residuals = y - y_pred_train
    std_error = np.std(residuals)

    # Build forecast feature matrix
    forecast_records = []
    last_date = df['date'].max()
    
    for i in range(1, days_to_forecast + 1):
        f_date = last_date + pd.Timedelta(days=i)
        
        # Build feature vector
        feat_df = pd.DataFrame([{
            'day_of_week': str(f_date.dayofweek),
            'day_of_month': f_date.day,
            'is_weekend': int(f_date.dayofweek in [5, 6])
        }])
        
        # Predict
        predicted = model.predict(feat_df)[0]
        predicted = max(predicted, 0.0)  # Cannot sell negative items
        
        # Compute dynamic confidence bounds using standard error of residuals
        # Using 95% confidence intervals (approx 1.96 * std_error)
        lower = max(int(predicted - 1.64 * std_error), 0)
        upper = int(predicted + 1.64 * std_error)

        forecast_records.append({
            "forecast_date": f_date.date(),
            "predicted_quantity": int(round(predicted)),
            "lower_bound": lower,
            "upper_bound": upper
        })

    return forecast_records
