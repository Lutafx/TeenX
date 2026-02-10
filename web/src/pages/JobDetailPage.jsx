import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  DollarSign, MapPin, Clock, Calendar, Users, Briefcase, 
  FileText, CheckCircle, XCircle, Phone, User, Mail 
} from 'lucide-react';

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    message: ''
  });
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      } else {
        navigate('/vacancies');
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const age = parseInt(formData.age);
    if (age < job.minAge) {
      alert(`К сожалению, эта вакансия доступна только для подростков от ${job.minAge} лет`);
      return;
    }

    if (age < 14) {
      alert('К сожалению, по законодательству РК работать можно только с 14 лет');
      return;
    }

    setApplying(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: id,
        jobTitle: job.title,
        employerId: job.employerId,
        ...formData,
        age: parseInt(formData.age),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setApplicationStatus('success');
      setFormData({ name: '', age: '', phone: '', email: '', message: '' });
      setTimeout(() => {
        setShowApplicationForm(false);
        setApplicationStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setApplicationStatus('error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка вакансии...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/vacancies')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center font-medium"
        >
          ← Назад к вакансиям
        </button>

        <div className="card mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
            <div className="flex items-center text-gray-600">
              <MapPin size={20} className="mr-2" />
              <span className="text-lg">{job.city || 'Уральск'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Заработная плата</p>
                <p className="text-3xl font-bold text-green-600">
                  {job.salaryFrom && job.salaryTo 
                    ? `до ${job.salaryTo.toLocaleString()}₸`
                    : job.salary || 'По договорённости'}
                </p>
                {job.salaryFrom && job.salaryTo && (
                  <p className="text-gray-600 mt-1">
                    от {job.salaryFrom.toLocaleString()}₸ до {job.salaryTo.toLocaleString()}₸ за месяц
                  </p>
                )}
                <p className="text-gray-600 mt-2">
                  {job.paymentType || 'на руки'}
                </p>
              </div>
              <DollarSign size={64} className="text-green-600 opacity-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Calendar className="text-blue-600 mr-2" size={20} />
                <span className="font-semibold">Выплаты</span>
              </div>
              <p className="text-gray-700">{job.paymentSchedule || 'два раза в месяц'}</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Users className="text-purple-600 mr-2" size={20} />
                <span className="font-semibold">Опыт работы</span>
              </div>
              <p className="text-gray-700">{job.experience || 'не требуется'}</p>
            </div>

            <div className="bg-pink-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Briefcase className="text-pink-600 mr-2" size={20} />
                <span className="font-semibold">Занятость</span>
              </div>
              <p className="text-gray-700">{job.employmentType || 'Полная занятость'}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Clock className="text-orange-600 mr-2" size={20} />
                <span className="font-semibold">График работы</span>
              </div>
              <p className="text-gray-700">{job.schedule || 'График: 5/2'}</p>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Clock className="text-indigo-600 mr-2" size={20} />
                <span className="font-semibold">Рабочие часы</span>
              </div>
              <p className="text-gray-700">{job.workingHours || '8 часов'}</p>
            </div>

            <div className="bg-teal-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <FileText className="text-teal-600 mr-2" size={20} />
                <span className="font-semibold">Формат работы</span>
              </div>
              <p className="text-gray-700">{job.workFormat || 'офис'}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">О компании</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {job.companyDescription || 'Информация о компании не указана'}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Чем предстоит заниматься</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {job.responsibilities || job.description || 'Описание обязанностей не указано'}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Что мы ожидаем от вас</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {job.requirements || 'Требования не указаны'}
            </div>
          </div>

          {job.benefits && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Что мы предлагаем</h2>
              <div className="text-gray-700 whitespace-pre-line">
                {job.benefits}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Возрастные ограничения:</strong> Эта вакансия доступна для подростков от {job.minAge} лет
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="btn-primary flex-1"
              >
                Откликнуться на вакансию
              </button>
              {job.contactPhone && (
                <a
                  href={`https://wa.me/${job.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 text-center"
                >
                  Написать в WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-3xl font-bold mb-6">Откликнуться на вакансию</h2>
              
              {applicationStatus === 'success' && (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6 flex items-start">
                  <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-green-800 mb-2">Отклик отправлен!</h3>
                    <p className="text-green-700">
                      Работодатель свяжется с вами в ближайшее время по указанному номеру телефона
                    </p>
                  </div>
                </div>
              )}

              {applicationStatus === 'error' && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6 flex items-start">
                  <XCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Ошибка</h3>
                    <p className="text-red-700">
                      Не удалось отправить отклик. Попробуйте позже или свяжитесь с работодателем напрямую
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <User className="inline mr-2" size={16} />
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Ваш возраст *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="14"
                    max="18"
                    className="input-field"
                    placeholder="Введите ваш возраст"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Минимальный возраст для этой вакансии: {job.minAge} лет
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Phone className="inline mr-2" size={16} />
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="+7 (777) 123-45-67"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Работодатель свяжется с вами по этому номеру
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email (необязательно)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    <FileText className="inline mr-2" size={16} />
                    Сопроводительное письмо (необязательно)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="input-field"
                    placeholder="Расскажите о себе и почему вы хотите работать на этой позиции..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn-primary flex-1"
                  >
                    {applying ? 'Отправка...' : 'Отправить отклик'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplicationForm(false);
                      setApplicationStatus(null);
                    }}
                    className="btn-cancel flex-1"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetailPage;
