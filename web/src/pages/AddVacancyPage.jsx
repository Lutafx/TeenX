import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Briefcase, DollarSign, MapPin, Clock, Calendar, Users, 
  FileText, Phone, Mail, Building, CheckCircle, XCircle 
} from 'lucide-react';

function AddVacancyPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    companyDescription: '',
    city: 'Уральск',
    salaryFrom: '',
    salaryTo: '',
    paymentType: 'на руки',
    paymentSchedule: 'два раза в месяц',
    experience: 'не требуется',
    employmentType: 'Полная занятость',
    schedule: 'График: 5/2',
    workingHours: '8 часов',
    workFormat: 'офис',
    minAge: '14',
    responsibilities: '',
    requirements: '',
    benefits: '',
    contactPhone: '',
    contactEmail: '',
    contactName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const jobData = {
        ...formData,
        salaryFrom: parseInt(formData.salaryFrom) || 0,
        salaryTo: parseInt(formData.salaryTo) || 0,
        minAge: parseInt(formData.minAge),
        status: 'pending',
        createdAt: serverTimestamp(),
        views: 0,
        applications: 0
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobData);
      
      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/vacancies');
      }, 2000);
    } catch (error) {
      console.error('Error submitting job:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Добавить вакансию</h1>
          <p className="text-gray-600 text-lg">
            Заполните форму ниже. Вакансия будет проверена администратором перед публикацией
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6 flex items-start">
            <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-green-800 mb-2">Вакансия отправлена на модерацию!</h3>
              <p className="text-green-700">
                Администратор проверит вакансию в течение 24 часов. После одобрения она появится на сайте
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6 flex items-start">
            <XCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-800 mb-2">Ошибка отправки</h3>
              <p className="text-red-700">
                Не удалось отправить вакансию. Попробуйте позже или свяжитесь с поддержкой
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Briefcase className="mr-2 text-blue-600" size={28} />
              Основная информация
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Название вакансии *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Например: Промоутер, Курьер, Помощник в офисе"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Building className="inline mr-2" size={16} />
                    Название компании *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="ТОО «Ваша компания»"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Город *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  О компании *
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="input-field"
                  placeholder="Расскажите о вашей компании, чем вы занимаетесь, какие ценности важны..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <DollarSign className="mr-2 text-green-600" size={28} />
              Условия оплаты
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Зарплата от (₸) *
                  </label>
                  <input
                    type="number"
                    name="salaryFrom"
                    value={formData.salaryFrom}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="input-field"
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Зарплата до (₸) *
                  </label>
                  <input
                    type="number"
                    name="salaryTo"
                    value={formData.salaryTo}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="input-field"
                    placeholder="400000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Тип выплаты
                  </label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="на руки">на руки</option>
                    <option value="до вычета налогов">до вычета налогов</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    График выплат
                  </label>
                  <select
                    name="paymentSchedule"
                    value={formData.paymentSchedule}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="два раза в месяц">два раза в месяц</option>
                    <option value="раз в месяц">раз в месяц</option>
                    <option value="раз в неделю">раз в неделю</option>
                    <option value="ежедневно">ежедневно</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Clock className="mr-2 text-purple-600" size={28} />
              Условия работы
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Users className="inline mr-2" size={16} />
                    Опыт работы
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="не требуется">не требуется</option>
                    <option value="1–3 года">1–3 года</option>
                    <option value="3–6 лет">3–6 лет</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Тип занятости
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="Полная занятость">Полная занятость</option>
                    <option value="Частичная занятость">Частичная занятость</option>
                    <option value="Проектная работа">Проектная работа</option>
                    <option value="Стажировка">Стажировка</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    График работы
                  </label>
                  <select
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="График: 5/2">График: 5/2</option>
                    <option value="График: 6/1">График: 6/1</option>
                    <option value="Сменный график">Сменный график</option>
                    <option value="Гибкий график">Гибкий график</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Рабочие часы в день
                  </label>
                  <select
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="4 часа">4 часа</option>
                    <option value="6 часов">6 часов</option>
                    <option value="8 часов">8 часов</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Формат работы
                  </label>
                  <select
                    name="workFormat"
                    value={formData.workFormat}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="офис">офис</option>
                    <option value="удалённо">удалённо</option>
                    <option value="разъездной">разъездной</option>
                    <option value="гибрид">гибрид</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Минимальный возраст *
                  </label>
                  <select
                    name="minAge"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="14">14 лет</option>
                    <option value="16">16 лет</option>
                    <option value="18">18 лет</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FileText className="mr-2 text-orange-600" size={28} />
              Описание вакансии
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Чем предстоит заниматься *
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="input-field"
                  placeholder="Опишите основные обязанности и задачи, которые будет выполнять сотрудник..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Что мы ожидаем от кандидата *
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="input-field"
                  placeholder="Укажите требования к кандидату: навыки, качества, образование..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Что мы предлагаем (необязательно)
                </label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  rows="4"
                  className="input-field"
                  placeholder="Бонусы, льготы, возможности для развития..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Phone className="mr-2 text-pink-600" size={28} />
              Контактная информация
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Контактное лицо *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Phone className="inline mr-2" size={16} />
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="+7 (777) 123-45-67"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Кандидаты смогут связаться с вами через WhatsApp
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email (необязательно)
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="hr@company.kz"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Модерация вакансий</h3>
            <p className="text-blue-800 text-sm">
              Все вакансии проходят проверку администратором перед публикацией. 
              Это гарантирует безопасность и легальность предложений для подростков. 
              Обычно проверка занимает до 24 часов.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Отправка...' : 'Отправить на модерацию'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vacancies')}
              className="btn-cancel flex-1"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddVacancyPage;
