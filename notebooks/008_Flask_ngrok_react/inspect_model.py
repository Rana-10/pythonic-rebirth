# import joblib
#
# model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/insurance_decision_tree_model.pkl")
#
# print(type(model))
# print(model.feature_names_in_)


import joblib

model = joblib.load("D:/CitrusBits/pythonic-rebirth/models/indian_diabetes_decision_tree.pkl")
print(model.feature_names_in_)
