"""strategy_eval 순수 로직 단위 테스트 (DB/네트워크 의존성 없음)."""
from app.strategy_eval import OPS_FN, evaluate_conditions

PER_LT_15 = {"field": "per", "op": "<", "value": 15}
PBR_LT_15 = {"field": "pbr", "op": "<", "value": 1.5}


def test_ops_fn_basic():
    assert OPS_FN[">"](5, 3) is True
    assert OPS_FN["<"](5, 3) is False
    assert OPS_FN[">="](3, 3) is True
    assert OPS_FN["<="](3, 3) is True
    assert OPS_FN["="](3, 3) is True


def test_and_all_true():
    funds = {"per": 10, "pbr": 1.0}
    assert evaluate_conditions(funds, [PER_LT_15, PBR_LT_15], "AND") is True


def test_and_one_false():
    funds = {"per": 20, "pbr": 1.0}
    assert evaluate_conditions(funds, [PER_LT_15, PBR_LT_15], "AND") is False


def test_or_one_true():
    funds = {"per": 20, "pbr": 1.0}
    assert evaluate_conditions(funds, [PER_LT_15, PBR_LT_15], "OR") is True


def test_missing_field_is_skipped_not_failed():
    # pbr 없음 → per 조건만 평가 → True
    funds = {"per": 10}
    assert evaluate_conditions(funds, [PER_LT_15, PBR_LT_15], "AND") is True


def test_no_evaluable_condition_returns_none():
    assert evaluate_conditions({}, [PER_LT_15]) is None


def test_none_value_returns_none():
    assert evaluate_conditions({"per": None}, [PER_LT_15]) is None


def test_unsupported_operator_skipped():
    assert evaluate_conditions({"per": 10}, [{"field": "per", "op": "~", "value": 15}]) is None


def test_non_numeric_value_skipped():
    assert evaluate_conditions({"per": "n/a"}, [PER_LT_15]) is None


def test_string_numeric_is_coerced():
    # DB 값이 문자열 "10" 으로 와도 숫자로 변환되어 평가된다
    assert evaluate_conditions({"per": "10"}, [PER_LT_15]) is True
