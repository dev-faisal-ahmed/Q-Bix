import React, { useState, useEffect } from "react";
import Modal from "../../../../components/shared/Modal";
import { toast } from "react-toastify";
import { toastConfig } from "../../../../toastConfig";
import { useReactToPrint } from "react-to-print";
import {
  colorBlue,
  colorGreen,
  colorInput,
  colorPupmkin,
  colorPurple,
} from "../../../../components/styles/colors";
import Admin from "../../../../js/admin";
import Input from "../../../../components/shared/Input";
import { serverAddress } from "../../../../components/variables";
import Option from "../../../../components/shared/option/Option";
import Loader from "../../../../components/shared/loader/Loader";
import { useRef } from "react";

const ControlCenter = () => {
  const styleClass = `px-5 py-3 rounded-lg w-fit font-semibold buble hover:scale-110`;
  const admin = new Admin();
  const [addmissionModal, setAdmissionModal] = useState(false);

  const updateCgpa = async () => {
    const res = await admin.updateCgpaAll();
    if (res) {
      toast("Updated!", toastConfig);
    } else {
      toast("Something Went Wrong", toastConfig);
    }
  };

  const updateWaiver = async () => {
    const res = await admin.updaWaiverAll();
    if (res) {
      toast("Updated", toastConfig);
    }
  };

  return (
    <section className="card w-fit mx-auto">
      <h1 className="text-2xl font-semibold text-center font-sans">Control Center</h1>
      <div className="flex gap-5 justify-center mt-8">
        <button
          className={styleClass}
          style={{ backgroundColor: colorPupmkin }}
          onClick={updateCgpa}
        >
          Update CGPA
        </button>
        <button
          className={styleClass}
          style={{ backgroundColor: colorGreen }}
          onClick={updateWaiver}
        >
          Update Waiver
        </button>
        <button className={styleClass} style={{ backgroundColor: colorBlue }}>
          New Semester
        </button>
        <button
          className={styleClass}
          style={{ backgroundColor: colorPurple }}
          onClick={() => setAdmissionModal(true)}
        >
          Admission
        </button>
        <Modal
          openModal={addmissionModal}
          setOpenModal={setAdmissionModal}
          title={"Admission"}
          width={"700px"}
        >
          <Admission />
        </Modal>
      </div>
    </section>
  );
};

const Admission = () => {
  const [admissionInfo, setAdmissionInfo] = useState({});
  const [selectedDept, setSelectedDept] = useState("");
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [printInfo, setPrintInfo] = useState({});
  const printRef = useRef();
  const admin = new Admin();

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  useEffect(() => {
    const url = `${serverAddress}/get-admission-info`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => setAdmissionInfo(res));
  }, []);

  useEffect(() => {
    const year = new Date().getFullYear();
    if (selectedDept) {
      const deptId = admissionInfo?.deptInfo?.[selectedDept]?.id;
      const id =
        year +
        deptId +
        admissionInfo?.deptInfo?.[selectedDept]?.lastIntake +
        admissionInfo?.studentsCount[selectedDept];
      setId(id);
      setPin(Date.now);
    }
  }, [selectedDept, admissionInfo]);

  const handelAdmission = (e) => {
    e.preventDefault();
    const admissionInfo = {
      name: e.target.elements.name.value.trim(),
      dept: selectedDept,
      intake: e.target.elements.intake.value.trim(),
      id: e.target.elements.id.value.trim(),
      pin: e.target.elements.pin.value.trim(),
      account: false,
    };
    setPrintInfo(admissionInfo);
    setSubmitted(true);
    admin.admitStd(admissionInfo);
  };

  if (!admissionInfo) {
    return <Loader />;
  }

  return (
    <div className="text-white p-5">
      {!submitted && (
        <form onSubmit={handelAdmission}>
          <div className="flex flex-col gap-4">
            <Input id="name" title="Student's Name" placeholder="Full Name" />
            <Option
              name="dept"
              color={colorInput}
              title="Department"
              values={Object.keys(admissionInfo?.deptInfo || {})}
              setState={setSelectedDept}
            />
            <Input
              id="intake"
              type="number"
              title="Intake"
              readOnly={true}
              value={admissionInfo?.deptInfo?.[selectedDept]?.lastIntake}
              placeholder="Intake"
            />

            <Input
              id="id"
              type="number"
              title="Id"
              readOnly={true}
              value={id}
              placeholder="11 Digit Id"
            />

            <Input
              id="pin"
              type="number"
              title="Pin"
              placeholder={"Pin will be genarated automatically"}
              value={pin}
              readOnly={true}
            />

            <button className="btnPay btn w-fit rounded-md buble hover:scale-110 mx-auto font-semibold">
              Submit
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="pb-8 border rounded-md">
          <div className="p-10" ref={printRef}>
            <div className="text-center mb-5">
              <h1 className=" font-mono text-2xl mb-8 font-semibold">
                Bangladesh University of Business And Technology (BUBT)
              </h1>
              <p className="underline font-semibold text-xl">Admission Form</p>
            </div>

            <div className="flex flex-col gap-3">
              <h3>
                Name : <strong>{printInfo?.name}</strong>
              </h3>
              <h3>
                Department : <strong className="uppercase">{printInfo?.dept}</strong>
              </h3>
              <h3>
                Intake : <strong>{printInfo?.intake}</strong>
              </h3>
              <h3>
                ID : <strong>{printInfo?.id}</strong>
              </h3>
              <h3>
                Pin : <strong>{printInfo?.pin}</strong>
              </h3>
            </div>
          </div>

          <button
            className="btn rounded-md w-fit mx-auto block px-10 buble"
            style={{ backgroundColor: colorGreen }}
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      )}
    </div>
  );
};

export default ControlCenter;