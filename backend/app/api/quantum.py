from fastapi import APIRouter
from app.schemas.schemas import QuantumOptimizeRequest, QuantumOptimizeResponse
from app.quantum.optimizer import simulated_annealing_qubo

router = APIRouter(prefix="/api/quantum", tags=["quantum"])


@router.post("/optimize", response_model=QuantumOptimizeResponse)
def optimize(req: QuantumOptimizeRequest):
    target_k = max(3, round(req.n_features * 0.45))
    result = simulated_annealing_qubo(
        n_features=req.n_features, target_k=target_k,
        iterations=req.iterations, seed=req.seed,
    )
    return QuantumOptimizeResponse(
        features_evaluated=result["features_evaluated"],
        features_selected=result["features_selected"],
        selected_feature_names=result["selected_feature_names"],
        optimization_iterations=result["optimization_iterations"],
        best_objective_score=result["best_objective_score"],
        optimization_time_sec=result["optimization_time_sec"],
        method=result["method"],
        disclaimer=result["disclaimer"],
    )
