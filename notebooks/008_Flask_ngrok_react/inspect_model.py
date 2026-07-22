# import joblib
#
# model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/insurance_decision_tree_model.pkl")
#
# print(type(model))
# print(model.feature_names_in_)


# import joblib
#
# model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/indian_diabetes_decision_tree.pkl")
# print(model.feature_names_in_)


# import joblib
#
# model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/insurance_decision_tree_model.pkl")
#
# print("Max depth:", model.get_depth())
# print("Number of leaves:", model.get_n_leaves())
# print("Feature importances:")
# for name, importance in zip(model.feature_names_in_, model.feature_importances_):
#     print(f"  {name}: {importance:.4f}")


# from sklearn.tree import export_text
# import joblib
#
# model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/indian_diabetes_decision_tree.pkl")
# feature_names = list(model.feature_names_in_)
# print(export_text(model, feature_names=feature_names))


# from sklearn.tree import export_text
# import joblib
#
# model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/insurance_decision_tree_model.pkl")
# feature_names = list(model.feature_names_in_)
# print(export_text(model, feature_names=feature_names))


# import joblib
# import numpy as np
# 
# scaler = joblib.load("D:/CitrusBits/pythonic-rebirth/models/insurance_scaler.pkl")
#
# case1 = np.array([[40, 14, 5]])
# case2 = np.array([[22, 20, 0]])
#
# print("Case 1 scaled:", scaler.transform(case1))
# print("Case 2 scaled:", scaler.transform(case2))
