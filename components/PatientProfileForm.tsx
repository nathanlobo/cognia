'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface PatientProfileFormProps {
  patientId: string
  onSave?: () => void
}

export default function PatientProfileForm({ patientId, onSave }: PatientProfileFormProps) {
  const [foods, setFoods] = useState('')
  const [hobbies, setHobbies] = useState('')
  const [region, setRegion] = useState('')
  const [routine, setRoutine] = useState('')
  const [dailyTask, setDailyTask] = useState('')
  
  // Vital details
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [familyMembers, setFamilyMembers] = useState('')

  // 3 Dedicated Memory Categories
  // 1. Family Memories
  const [famMemoryTitle, setFamMemoryTitle] = useState('')
  const [famMemoryDesc, setFamMemoryDesc] = useState('')
  const [famMemoryReminder, setFamMemoryReminder] = useState('')

  // 2. Hobby Memories
  const [hobbyMemoryTitle, setHobbyMemoryTitle] = useState('')
  const [hobbyMemoryDesc, setHobbyMemoryDesc] = useState('')
  const [hobbyMemoryReminder, setHobbyMemoryReminder] = useState('')

  // 3. Regional / Cultural Memories
  const [regionalMemoryTitle, setRegionalMemoryTitle] = useState('')
  const [regionalMemoryDesc, setRegionalMemoryDesc] = useState('')
  const [regionalMemoryReminder, setRegionalMemoryReminder] = useState('')

  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [initialState, setInitialState] = useState('')

  const currentStateString = JSON.stringify({
    foods,
    hobbies,
    region,
    routine,
    dailyTask,
    address,
    phoneNumber,
    familyMembers,
    famMemoryTitle,
    famMemoryDesc,
    famMemoryReminder,
    hobbyMemoryTitle,
    hobbyMemoryDesc,
    hobbyMemoryReminder,
    regionalMemoryTitle,
    regionalMemoryDesc,
    regionalMemoryReminder
  })
  
  const hasChanges = currentStateString !== initialState

  useEffect(() => {
    async function loadPreferences() {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', patientId)
        .single()

      if (!error && data?.preferences) {
        const p = data.preferences
        const loadedFoods = Array.isArray(p.favorite_foods) ? p.favorite_foods.join(', ') : ''
        const loadedHobbies = Array.isArray(p.hobbies) ? p.hobbies.join(', ') : (p.hobby_memory_hobbies || '')
        const loadedRegion = p.cultural_region || p.regional_memory_region || ''
        const loadedDailyTask = p.caregiver_daily_task || ''
        const loadedAddress = p.address || ''
        const loadedPhoneNumber = p.phone_number || ''
        let loadedFamily = ''
        let loadedRoutine = ''

        if (p.family_members && Array.isArray(p.family_members)) {
          loadedFamily = p.family_members.map((fm: any) => `${fm.relation}: ${fm.name}`).join('\n')
        } else if (p.family_memory_members) {
          loadedFamily = p.family_memory_members
        }
        
        if (p.daily_routine) {
          if (typeof p.daily_routine === 'string') {
            loadedRoutine = p.daily_routine
          } else {
            loadedRoutine = Object.entries(p.daily_routine).map(([k, v]) => `${k}: ${v}`).join('\n')
          }
        }

        // 1. Family Memories strictly from DB
        const loadedFamTitle = p.family_memory_title || ''
        const loadedFamDesc = p.family_memory_desc || ''
        const loadedFamReminder = p.family_memory_reminder || ''

        // 2. Hobby Memories strictly from DB
        const loadedHobbyTitle = p.hobby_memory_title || ''
        const loadedHobbyDesc = p.hobby_memory_desc || ''
        const loadedHobbyReminder = p.hobby_memory_reminder || ''

        // 3. Regional Memories strictly from DB
        const loadedRegionalTitle = p.regional_memory_title || ''
        const loadedRegionalDesc = p.regional_memory_desc || ''
        const loadedRegionalReminder = p.regional_memory_reminder || ''

        setFoods(loadedFoods)
        setHobbies(loadedHobbies)
        setRegion(loadedRegion)
        setDailyTask(loadedDailyTask)
        setAddress(loadedAddress)
        setPhoneNumber(loadedPhoneNumber)
        setFamilyMembers(loadedFamily)
        setRoutine(loadedRoutine)

        setFamMemoryTitle(loadedFamTitle)
        setFamMemoryDesc(loadedFamDesc)
        setFamMemoryReminder(loadedFamReminder)

        setHobbyMemoryTitle(loadedHobbyTitle)
        setHobbyMemoryDesc(loadedHobbyDesc)
        setHobbyMemoryReminder(loadedHobbyReminder)

        setRegionalMemoryTitle(loadedRegionalTitle)
        setRegionalMemoryDesc(loadedRegionalDesc)
        setRegionalMemoryReminder(loadedRegionalReminder)

        setInitialState(JSON.stringify({
          foods: loadedFoods,
          hobbies: loadedHobbies,
          region: loadedRegion,
          routine: loadedRoutine,
          dailyTask: loadedDailyTask,
          address: loadedAddress,
          phoneNumber: loadedPhoneNumber,
          familyMembers: loadedFamily,
          famMemoryTitle: loadedFamTitle,
          famMemoryDesc: loadedFamDesc,
          famMemoryReminder: loadedFamReminder,
          hobbyMemoryTitle: loadedHobbyTitle,
          hobbyMemoryDesc: loadedHobbyDesc,
          hobbyMemoryReminder: loadedHobbyReminder,
          regionalMemoryTitle: loadedRegionalTitle,
          regionalMemoryDesc: loadedRegionalDesc,
          regionalMemoryReminder: loadedRegionalReminder
        }))
      }
      setLoading(false)
    }
    loadPreferences()
  }, [patientId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus('saving')
    setErrorMessage('')

    const foodArray = foods.split(',').map(f => f.trim()).filter(Boolean)
    const hobbyArray = hobbies.split(',').map(h => h.trim()).filter(Boolean)
    
    // Parse routine string into an object if possible
    let routineObj: any = routine
    try {
      const lines = routine.split('\n').filter(Boolean)
      if (lines.length > 0 && lines.some(l => l.includes(':'))) {
        routineObj = {}
        lines.forEach(l => {
          const [k, ...v] = l.split(':')
          if (k && v.length) {
            routineObj[k.trim()] = v.join(':').trim()
          }
        })
      }
    } catch (err) {}

    // Parse family members string to array of objects
    const familyArray: {relation: string, name: string}[] = []
    try {
      const lines = familyMembers.split('\n').filter(Boolean)
      lines.forEach(l => {
        const [rel, ...nm] = l.split(':')
        if (rel && nm.length) {
          familyArray.push({ relation: rel.trim(), name: nm.join(':').trim() })
        }
      })
    } catch (err) {}

    const preferences = {
      favorite_foods: foodArray,
      hobbies: hobbyArray,
      cultural_region: region.trim(),
      daily_routine: routineObj,
      caregiver_daily_task: dailyTask.trim(),
      address: address.trim(),
      phone_number: phoneNumber.trim(),
      family_members: familyArray,
      // 3 Dedicated Memory Categories
      family_memory_title: famMemoryTitle.trim(),
      family_memory_desc: famMemoryDesc.trim(),
      family_memory_members: familyMembers.trim(),
      family_memory_reminder: famMemoryReminder.trim(),

      hobby_memory_title: hobbyMemoryTitle.trim(),
      hobby_memory_desc: hobbyMemoryDesc.trim(),
      hobby_memory_hobbies: hobbies.trim(),
      hobby_memory_reminder: hobbyMemoryReminder.trim(),

      regional_memory_title: regionalMemoryTitle.trim(),
      regional_memory_desc: regionalMemoryDesc.trim(),
      regional_memory_region: region.trim(),
      regional_memory_reminder: regionalMemoryReminder.trim(),
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', patientId)

      if (error) throw error
      
      setSaveStatus('saved')
      setInitialState(currentStateString)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('patient_preferences_updated'))
      }
      if (onSave) onSave()
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: any) {
      console.error(err)
      setSaveStatus('error')
      setErrorMessage(err.message || 'Failed to save preferences')
    }
  }

  const handleAutoFillSuggestions = () => {
    const hobbyItem = hobbies.split(',')[0]?.trim() || 'Gardening'
    const regItem = region.trim() || 'Homeland'
    const fmLine = familyMembers.split('\n')[0]?.trim()
    const fmName = fmLine ? (fmLine.includes(':') ? fmLine.split(':')[1].trim() : fmLine) : 'Family'
    const fmRel = fmLine ? (fmLine.includes(':') ? fmLine.split(':')[0].trim() : 'Family') : 'Family'

    if (!famMemoryTitle) setFamMemoryTitle(`Time with ${fmName}`)
    if (!famMemoryDesc) setFamMemoryDesc(`Sitting together, enjoying warm home-cooked meals, and sharing sweet conversations with ${fmName}.`)
    if (!famMemoryReminder) setFamMemoryReminder(`Your ${fmRel.toLowerCase()}, ${fmName}, and family hold you close in their hearts every day.`)

    if (!hobbyMemoryTitle) setHobbyMemoryTitle(`Joy of ${hobbyItem}`)
    if (!hobbyMemoryDesc) setHobbyMemoryDesc(`Caring for ${hobbyItem.toLowerCase()}, working with your hands, and finding calm in creative crafts.`)
    if (!hobbyMemoryReminder) setHobbyMemoryReminder(`Enjoying ${hobbyItem.toLowerCase()} has always brought deep peace, focus, and happiness.`)

    if (!regionalMemoryTitle) setRegionalMemoryTitle(`Memories of ${regItem}`)
    if (!regionalMemoryDesc) setRegionalMemoryDesc(`The fresh morning breeze, drinking warm tea on the veranda, and listening to traditional melodies of ${regItem}.`)
    if (!regionalMemoryReminder) setRegionalMemoryReminder(`The timeless culture and golden memories of ${regItem} remain close to your heart.`)
  }

  if (loading) {
    return <div className="p-4 text-slate-500">Loading personalization profile...</div>
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">✨</span>
          AI Personalization Profile
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Fill out these details to help our AI generate highly personalized cognitive exercises matching the patient's lived experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="region" className="block text-sm font-bold text-slate-700 mb-1">
            Cultural & Geographic Region
          </label>
          <input
            id="region"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., Assam, Meghalaya, Scotland, etc."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="foods" className="block text-sm font-bold text-slate-700 mb-1">
            Favorite Foods (comma separated)
          </label>
          <input
            id="foods"
            type="text"
            value={foods}
            onChange={(e) => setFoods(e.target.value)}
            placeholder="e.g., Assam Tea, Pitha, Masor Tenga"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="hobbies" className="block text-sm font-bold text-slate-700 mb-1">
            Hobbies & Interests (comma separated)
          </label>
          <input
            id="hobbies"
            type="text"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            placeholder="e.g., Gardening, Knitting, Reading"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="routine" className="block text-sm font-bold text-slate-700 mb-1">
            Daily Routine (key events)
          </label>
          <textarea
            id="routine"
            value={routine}
            onChange={(e) => setRoutine(e.target.value)}
            placeholder="e.g.&#10;Morning: Tea at 8 AM&#10;Evening: Walk in the garden"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
          ></textarea>
        </div>

        <div>
          <label htmlFor="dailyTask" className="block text-sm font-bold text-slate-700 mb-1">
            Caregiver Daily Task Message
          </label>
          <input
            id="dailyTask"
            type="text"
            value={dailyTask}
            onChange={(e) => setDailyTask(e.target.value)}
            placeholder="e.g., Please remind them to water the Tulsi plant today."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
          />
        </div>

        {/* ── Memories & Reminiscence Hub (3 Categories) ── */}
        <div className="pt-6 border-t-2 border-slate-200">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">📖</span>
                <span>Memories & Reminiscence Hub (3 Sections)</span>
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Customize the 3 memory stories stored in the database for the patient portal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillSuggestions}
              className="self-start sm:self-auto text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>✨</span>
              <span>Auto-fill Starter Suggestions</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Section 1: Family Memories */}
            <div className="bg-[#FDECE1]/60 border-2 border-[#F3D5B5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👨‍👩‍👧</span>
                  <h4 className="text-base font-bold text-[#C05621]">1. Family Memories (Fam Memories)</h4>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/80 text-[#C05621] border border-[#F3D5B5]">
                  AI Theme Artwork Enabled
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-3">
                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-[#F3D5B5] shadow-xs relative">
                  <img src="/images/memories/family_cover.jpg" alt="Family Memory Theme" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label htmlFor="famTitle" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Memory Title
                    </label>
                    <input
                      id="famTitle"
                      type="text"
                      value={famMemoryTitle}
                      onChange={(e) => setFamMemoryTitle(e.target.value)}
                      placeholder="e.g., Sunday Dinners with Sarah & David"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B5] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#C05621]/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="famDesc" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Family Story / Description
                  </label>
                  <textarea
                    id="famDesc"
                    value={famMemoryDesc}
                    onChange={(e) => setFamMemoryDesc(e.target.value)}
                    placeholder="e.g., Sitting together at the dining table, enjoying home-cooked meals, and listening to grandchildren laugh."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B5] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#C05621]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="famReminder" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Loving Reminder Note
                  </label>
                  <input
                    id="famReminder"
                    type="text"
                    value={famMemoryReminder}
                    onChange={(e) => setFamMemoryReminder(e.target.value)}
                    placeholder="e.g., Your family loves you dearly and is always with you in spirit."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F3D5B5] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#C05621]/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hobby Memories */}
            <div className="bg-[#E6F4EA]/60 border-2 border-[#A8DAB5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <h4 className="text-base font-bold text-[#137333]">2. Hobby & Interest Memories (Hobby Memories)</h4>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/80 text-[#137333] border border-[#A8DAB5]">
                  AI Theme Artwork Enabled
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-3">
                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-[#A8DAB5] shadow-xs relative">
                  <img src="/images/memories/hobby_cover.jpg" alt="Hobby Memory Theme" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label htmlFor="hobbyTitle" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hobby Memory Title
                    </label>
                    <input
                      id="hobbyTitle"
                      type="text"
                      value={hobbyMemoryTitle}
                      onChange={(e) => setHobbyMemoryTitle(e.target.value)}
                      placeholder="e.g., Afternoon Gardening & Planting Roses"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#A8DAB5] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#137333]/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="hobbyDesc" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hobby Story / Description
                  </label>
                  <textarea
                    id="hobbyDesc"
                    value={hobbyMemoryDesc}
                    onChange={(e) => setHobbyMemoryDesc(e.target.value)}
                    placeholder="e.g., Caring for the blooming rose bushes, pruning the fresh leaves, and feeling the warm morning sunshine in the backyard."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#A8DAB5] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#137333]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="hobbyReminder" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hobby Reflection Note
                  </label>
                  <input
                    id="hobbyReminder"
                    type="text"
                    value={hobbyMemoryReminder}
                    onChange={(e) => setHobbyMemoryReminder(e.target.value)}
                    placeholder="e.g., Working with nature and crafts has always brought deep peace and calm."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#A8DAB5] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#137333]/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Regional & Cultural Memories */}
            <div className="bg-[#E8F0FE]/60 border-2 border-[#AECBFA] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏞️</span>
                  <h4 className="text-base font-bold text-[#1A73E8]">3. Regional & Cultural Memories (Regional Memories)</h4>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/80 text-[#1A73E8] border border-[#AECBFA]">
                  AI Theme Artwork Enabled
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-3">
                <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-[#AECBFA] shadow-xs relative">
                  <img src="/images/memories/regional_cover.jpg" alt="Regional Memory Theme" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label htmlFor="regTitle" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Regional Memory Title
                    </label>
                    <input
                      id="regTitle"
                      type="text"
                      value={regionalMemoryTitle}
                      onChange={(e) => setRegionalMemoryTitle(e.target.value)}
                      placeholder="e.g., Memories of Hometown Rivers & Morning Tea"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#AECBFA] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#1A73E8]/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label htmlFor="regDesc" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Regional & Cultural Story
                  </label>
                  <textarea
                    id="regDesc"
                    value={regionalMemoryDesc}
                    onChange={(e) => setRegionalMemoryDesc(e.target.value)}
                    placeholder="e.g., The crisp morning air, drinking freshly brewed tea on the veranda, and listening to traditional festive songs."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AECBFA] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#1A73E8]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="regReminder" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cultural Heritage Note
                  </label>
                  <input
                    id="regReminder"
                    type="text"
                    value={regionalMemoryReminder}
                    onChange={(e) => setRegionalMemoryReminder(e.target.value)}
                    placeholder="e.g., The beloved sights and traditions of your homeland always remain close to your heart."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#AECBFA] bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#1A73E8]/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Vital Details (For Memory Exercises)</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-1">
                Home Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Maple Street, Springville"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 555-0198"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="family" className="block text-sm font-bold text-slate-700 mb-1">
                Family Members (Relation: Name)
              </label>
              <textarea
                id="family"
                value={familyMembers}
                onChange={(e) => setFamilyMembers(e.target.value)}
                placeholder="e.g.&#10;Daughter: Sarah&#10;Son: David"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900"
              ></textarea>
            </div>
          </div>
        </div>

        {saveStatus === 'error' && (
          <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saveStatus === 'saving' || !hasChanges}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm transition-colors"
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
          </button>
          
          {saveStatus === 'saved' && (
            <span className="text-green-600 font-bold flex items-center gap-2 animate-in fade-in duration-300">
              <span>✅</span> Saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
