// PrizeWheel.jsx
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./PrizeWheel.module.scss";
import Wheel from "../Wheel";
import Cookies from "js-cookie";
import axios from "axios";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  mobile: Yup.string()
    .required("Mobile number is required")
    .matches(/^\d+$/, "Only digits are allowed")
    .length(10, "Mobile number must be exactly 10 digits"),
});

const PrizeWheel = () => {
  const [spinShown, setSpinShown] = useState(false);
  const [isMobileDirty, setIsMobileDirty] = useState(false);

  const handleSubmit = (values, { setSubmitting }) => {
    console.log("Form values:", values);

    axios
      .post(`${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/user`, {
        name: values.name,
        phone: `+91 ${values.mobile}`,
      })
      .then(function (res) {
        console.log(res);
        localStorage.setItem(
          "token",
          res.headers["X-Auth-Token"] || res.headers["x-auth-token"]
        );

        Cookies.set(
          "token",
          res.headers["X-Auth-Token"] || res.headers["x-auth-token"],
          { expires: 365 }
        );
        setSpinShown(true);
      })
      .catch(function (error) {
        console.log(error);
      });
    setSubmitting(false);
  };

  return (
    <div className={styles.background}>
      {!spinShown && (
        <div className={styles.container}>
          <div className={styles.formSection} style={{ position: "relative" }}>
            <div className={styles.formContent}>
              <div
                className={styles.webkitcenter}
                style={{ marginBottom: "20px" }}
              >
                <img src="/wibesLogo.svg" />
              </div>
              <h1 className={styles.title}>Try your luck at WIBES.</h1>

              <Formik
                initialValues={{ name: "", mobile: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({ isSubmitting, errors, touched, values, isValid }) => {
                  // Check if mobile validation should be performed
                  const hasMobileError =
                    isMobileDirty && values.mobile.length !== 10;
                  // Check if name is valid
                  const hasNameError = touched.name && errors.name;
                  // Check if form can be submitted
                  const canSubmit =
                    !hasMobileError &&
                    values.name.trim() !== "" &&
                    values.mobile.length === 10;

                  return (
                    <Form className={styles.form}>
                      <div className={styles.inputGroup}>
                        <Field
                          type="text"
                          name="name"
                          placeholder="ENTER NAME"
                          className={`${styles.input} ${
                            hasNameError ? styles.inputError : ""
                          }`}
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className={styles.errorMessage}
                        />
                      </div>

                      <div
                        className={styles.inputGroup}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            borderRadius: "50%",
                            padding: "14px",
                            background: "rgb(44, 30, 90)",
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "16px",
                          }}
                        >
                          +91
                        </div>
                        <Field name="mobile">
                          {({ field, form }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="ENTER MOBILE NUMBER"
                              maxLength="10"
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "");
                                if (!isMobileDirty && value.length > 0) {
                                  setIsMobileDirty(true);
                                }
                                form.setFieldValue("mobile", value, true);
                              }}
                              onBlur={(e) => {
                                field.onBlur(e);
                                if (e.target.value.length > 0) {
                                  setIsMobileDirty(true);
                                }
                              }}
                              className={`${styles.input} ${
                                hasMobileError ? styles.inputError : ""
                              }`}
                            />
                          )}
                        </Field>
                        {hasMobileError && (
                          <div className={styles.errorMessage}>
                            {values.mobile.length === 0
                              ? "Mobile number is required"
                              : "Mobile number must be exactly 10 digits"}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || !canSubmit}
                      >
                        SUBMIT
                      </button>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>

          <div className={styles.wheelSection}>
            <div className={styles.wheelImg}>
              <img src="/wheel.png" alt="wheel" />
            </div>
          </div>
        </div>
      )}

      {spinShown && (
        <div className={styles.container2}>
          <Wheel
            setSpinShown={setSpinShown}
            setIsMobileDirty={setIsMobileDirty}
          />
        </div>
      )}
    </div>
  );
};

export default PrizeWheel;
