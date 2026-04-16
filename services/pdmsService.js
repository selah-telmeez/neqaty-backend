const pdmsRepository = require("../repositories/pdmsRepository");
const { calculateFormScore, calculateInterviewTestScore, calculateMcqExamsScore } = require("./pdms.scoring");

exports.getWatomsFormsData = async () => {
  const forms = await pdmsRepository.fetchWatomsForms();
  return forms;
};

exports.getWisdomFormsData = async () => {
  const forms = await pdmsRepository.fetchWisdomForms();
  return forms;
};

exports.getPedagogicalTestData = async () => {
  const test = await pdmsRepository.fetchPedagogicalTest();
  return test;
};

exports.getWisdomDashboardData = async () => {
  const test = await pdmsRepository.fetchWisdomPdmsDashboardData();
  const { pedagogicalTests, interviews, forms } = test;
  const groupedByForm = forms.reduce(
    (acc, form) => {
      if (form.results?.every(r => r.question?.sub_field?.field?.form_id === 37)) {
        acc.teacherSelf.push(form);
      }
      if (form.results?.every(r => r.question?.sub_field?.field?.form_id === 83)) {
        acc.cro.push(form);
      }
      return acc;
    },
    { teacherSelf: [], cro: [] }
  );
  const pedagogicalScores = calculateMcqExamsScore(pedagogicalTests);
  const interviewScores = calculateInterviewTestScore(interviews);
  const teacherSelfForms = calculateFormScore(groupedByForm.teacherSelf);
  const croForms = calculateFormScore(groupedByForm.cro);

  return {
    pedagogicalScores,
    interviewScores,
    teacherSelfForms,
    croForms
  };
};

exports.getWatomsDashboardData = async () => {
  const test = await pdmsRepository.fetchWatomsPdmsDashboardData();
  const { pedagogicalTests, interviews, forms } = test;
  const groupedByForm = forms.reduce(
    (acc, form) => {
      if (form.results?.every(r => r.question?.sub_field?.field?.form_id === 37 || r.question?.sub_field?.field?.form_id === 85)) {
        acc.teacherSelf.push(form);
      }
      if (form.results?.every(r => r.question?.sub_field?.field?.form_id === 38 || r.question?.sub_field?.field?.form_id === 86)) {
        acc.student.push(form);
      }
      if (form.results?.every(r => r.question?.sub_field?.field?.form_id === 83 || r.question?.sub_field?.field?.form_id === 84)) {
        acc.cro.push(form);
      }
      return acc;
    },
    { teacherSelf: [], student: [], cro: [] }
  );
  const pedagogicalScores = calculateMcqExamsScore(pedagogicalTests);
  const interviewScores = calculateInterviewTestScore(interviews);
  const teacherSelfForms = calculateFormScore(groupedByForm.teacherSelf);
  const studentTeacherForms = calculateFormScore(groupedByForm.student);
  const croForms = calculateFormScore(groupedByForm.cro);

  return {
    pedagogicalScores,
    interviewScores,
    teacherSelfForms,
    studentTeacherForms,
    croForms
  };
};