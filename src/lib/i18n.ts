import { Language } from '@/context/AppContext';

export interface Translations {
  common: {
    appName: string;
    appHindi: string;
    farmerHelp: string;
    guideBtn: string;
    themeToggle: string;
    lightMode: string;
    darkMode: string;
    backBtn: string;
    backHome: string;
    tryAgain: string;
    errorTitle: string;
    loading: string;
    close: string;
  };
  home: {
    heroTitle: string;
    heroDesc: string;
    checkCropBtn: string;
    advisoryBtn: string;
    guideBtn: string;
    footerText: string;
  };
  diagnose: {
    title: string;
    subtitle: string;
    selectMode: string;
    photoTab: string;
    voiceTab: string;
    takePhoto: string;
    photoSub: string;
    orVoice: string;
    voiceSub: string;
    recording: string;
    stopRecording: string;
    analyzing: string;
    waitNote: string;
    healthyTag: string;
    diseaseTag: string;
    confidenceLabel: string;
    confidenceHigh: string;
    confidenceModerate: string;
    confidenceLow: string;
    recommendationTitle: string;
    replayAudio: string;
    checkAnother: string;
    errorTitle: string;
    errorDesc: string;
    stagedAudioAlert: string;
    clearStagedAudio: string;
    diagnoseBtn: string;
  };
  advisory: {
    title: string;
    subtitle: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    selectState: string;
    selectDistrict: string;
    selectCrop: string;
    nextBtn: string;
    changeBtn: string;
    getAdvisory: string;
    analyzing: string;
    waitNote: string;
    weatherConditions: string;
    advisoryHeader: string;
    replayAudio: string;
    checkAnother: string;
    temp: string;
    humidity: string;
    wind: string;
    rainChance: string;
    errorTitle: string;
    errorDesc: string;
  };
  guidance: {
    modalTitle: string;
    tabGuide: string;
    tabAccessibility: string;
    tabRecorder: string;
    guideTitle1: string;
    guideTip1: string;
    guideTitle2: string;
    guideTip2: string;
    guideTitle3: string;
    guideTip3: string;
    listenSpokenGuide: string;
    playingAudio: string;
    accessTitle: string;
    themeModeTitle: string;
    themeModeDesc: string;
    speechTitle: string;
    speechDesc: string;
    largeTargetTitle: string;
    largeTargetDesc: string;
    motionTitle: string;
    motionDesc: string;
  };
  recorder: {
    title: string;
    desc: string;
    categoryLabel: string;
    catLeafDisease: string;
    catPest: string;
    catWeather: string;
    catGeneral: string;
    startBtn: string;
    stopBtn: string;
    recordingNow: string;
    previewTitle: string;
    playBtn: string;
    pauseBtn: string;
    sendToDiagnoseBtn: string;
    savedListTitle: string;
    noRecordings: string;
    clearBtn: string;
    justNow: string;
  };
}

export const I18N: Record<Language, Translations> = {
  hi: {
    common: {
      appName: 'FasalSetu',
      appHindi: 'फसल सेतु',
      farmerHelp: 'किसान सहायता',
      guideBtn: 'मार्गदर्शन',
      themeToggle: 'थीम बदलें',
      lightMode: 'दिन (Light)',
      darkMode: 'रात (Dark)',
      backBtn: 'पीछे जाएं',
      backHome: '← होम पेज पर लौटें',
      tryAgain: 'पुनः प्रयास करें',
      errorTitle: 'जांच पूरी नहीं हो सकी',
      loading: 'प्रतीक्षा करें...',
      close: 'बंद करें',
    },
    home: {
      heroTitle: 'फसल की बीमारी पहचानें और मौसम सलाह पाएं।',
      heroDesc: 'पत्ती की फोटो खींचकर या बोलकर बीमारी का तुरंत समाधान पाएं, और अपने जिले का मौसम-आधारित सिंचाई व कृषि परामर्श जानें।',
      checkCropBtn: 'मेरी फसल जांचें (फोटो / आवाज)',
      advisoryBtn: 'मौसम व कृषि सलाह (जिले अनुसार)',
      guideBtn: 'शुरुआती मार्गदर्शिका व फील्ड रिकॉर्डर',
      footerText: 'भारतीय कृषि के लिए विशेष निर्मित | दिन की तेज धूप और रात के अंधेरे दोनों में स्पष्ट',
    },
    diagnose: {
      title: 'फसल की जांच',
      subtitle: 'बीमारी का त्वरित समाधान',
      selectMode: 'फसल जांचने का तरीका चुनें:',
      photoTab: 'फोटो (Photo)',
      voiceTab: 'आवाज (Voice)',
      takePhoto: 'पत्ती की फोटो खींचें',
      photoSub: 'कैमरा खोलें या गैलरी से चुनें',
      orVoice: 'बोलकर समस्या बताएं',
      voiceSub: 'अपनी भाषा में समस्या बोलकर रिकॉर्ड करें',
      recording: 'बोलिए... हम सुन रहे हैं',
      stopRecording: 'रिकॉर्डिंग समाप्त करें',
      analyzing: 'फसल की जांच हो रही है...',
      waitNote: 'इसमें 3 से 5 सेकंड का समय लगता है',
      healthyTag: 'स्वस्थ फसल',
      diseaseTag: 'बीमारी का लक्षण',
      confidenceLabel: 'विश्वसनीयता:',
      confidenceHigh: 'उच्च (High)',
      confidenceModerate: 'मध्यम (Moderate)',
      confidenceLow: 'कम (Low)',
      recommendationTitle: 'किसान भाइयों के लिए समाधान:',
      replayAudio: 'आवाज फिर से सुनें',
      checkAnother: 'दूसरी फसल की जांच करें',
      errorTitle: 'जांच पूरी नहीं हो सकी',
      errorDesc: 'हम आपकी फसल की जांच नहीं कर सके, कृपया दोबारा प्रयास करें।',
      stagedAudioAlert: 'फील्ड रिकॉर्डर से वॉयस नोट लोड किया गया है।',
      clearStagedAudio: 'हटाएं',
      diagnoseBtn: 'जांचें',
    },
    advisory: {
      title: 'मौसम व फसल सलाह',
      subtitle: 'आपके जिले का सटीक पूर्वानुमान',
      step1Title: 'कदम 1: राज्य चुनें',
      step2Title: 'कदम 2: जिला चुनें',
      step3Title: 'कदम 3: फसल चुनें',
      selectState: 'अपना राज्य चुनें',
      selectDistrict: 'अपना जिला चुनें',
      selectCrop: 'अपनी फसल चुनें',
      nextBtn: 'आगे बढ़ें',
      changeBtn: 'बदलें',
      getAdvisory: 'मौसम व कृषि सलाह पाएं',
      analyzing: 'मौसम की जानकारी और सलाह तैयार हो रही है...',
      waitNote: 'इसमें 3 से 5 सेकंड का समय लगता है',
      weatherConditions: 'वर्तमान मौसम स्थिति',
      advisoryHeader: 'किसान भाइयों के लिए समयोचित सलाह:',
      replayAudio: 'सलाह आवाज में सुनें',
      checkAnother: 'दूसरे जिले या फसल की सलाह देखें',
      temp: 'तापमान',
      humidity: 'हवा में नमी',
      wind: 'हवा की गति',
      rainChance: 'बारिश की संभावना',
      errorTitle: 'सलाह प्राप्त नहीं हो सकी',
      errorDesc: 'मौसम की जानकारी प्राप्त करने में समस्या आई, कृपया दोबारा प्रयास करें।',
    },
    guidance: {
      modalTitle: 'किसान मार्गदर्शिका व सुगमता',
      tabGuide: 'मार्गदर्शन',
      tabAccessibility: 'सुगमता (Accessibility)',
      tabRecorder: 'फील्ड रिकॉर्डर',
      guideTitle1: '1. पत्ती की सही फोटो कैसे लें?',
      guideTip1: 'मोबाइल कैमरे को प्रभावित पत्ती से 6 से 8 इंच दूर रखें। सीधी धूप या अच्छी रोशनी में फोटो लें ताकि धब्बे साफ दिखें। धुंधली फोटो न लें।',
      guideTitle2: '2. बोलकर बीमारी कैसे बताएं?',
      guideTip2: 'माइक का बटन दबाएं और अपनी भाषा में बताएं—जैसे "टमाटर की पत्तियां पीली पड़ रही हैं और काले धब्बे हैं।" फिर रिकॉर्डिंग समाप्त करें।',
      guideTitle3: '3. मौसम व सिंचाई सलाह कैसे लें?',
      guideTip3: 'अपना राज्य और जिला चुनें, फिर फसल चुनें। ऐप वास्तविक समय के मौसम (तापमान, वर्षा, नमी) के आधार पर सिंचाई और दवा छिड़काव की सही सलाह देगा।',
      listenSpokenGuide: 'गाइड को आवाज में सुनें',
      playingAudio: 'ऑडियो चल रहा है...',
      accessTitle: 'सुगमता व देखने की सुविधाएं',
      themeModeTitle: 'डार्क मोड (नाइट विजन)',
      themeModeDesc: 'कम रोशनी या शाम के समय आंखों पर तनाव कम करने और बैटरी बचाने के लिए डार्क मोड ऑन करें।',
      speechTitle: 'आवाज में सुनना (Voice Readout)',
      speechDesc: 'पढ़ने में कठिनाई होने पर हर निदान और सलाह को आवाज में सुनने के लिए लाउडस्पीकर बटन दबाएं।',
      largeTargetTitle: 'बड़े टच बटन',
      largeTargetDesc: 'खेत में काम करते समय आसानी से उंगली से छूने के लिए सभी बटन बड़े आकार में बनाए गए हैं।',
      motionTitle: 'सरल एनिमेशन',
      motionDesc: 'स्क्रीन पर अत्यधिक झटकों से बचने के लिए आरामदायक और स्थिर दृश्य डिज़ाइन।',
    },
    recorder: {
      title: 'फील्ड ऑडियो रिकॉर्डर (अपनी आवाज में नोट बनाएं)',
      desc: 'खेत में घूमते समय किसी भी समस्या या लक्षण को अपनी आवाज में रिकॉर्ड करके सुरक्षित रखें या तुरंत जांच के लिए भेजें।',
      categoryLabel: 'समस्या का प्रकार चुनें:',
      catLeafDisease: 'पत्ती की बीमारी (Leaf Disease)',
      catPest: 'कीट व इल्ली (Pests)',
      catWeather: 'सिंचाई व मौसम (Weather/Irrigation)',
      catGeneral: 'सामान्य नोट (General Note)',
      startBtn: 'माइक दबाकर बोलें',
      stopBtn: 'रिकॉर्डिंग समाप्त करें',
      recordingNow: 'रिकॉर्डिंग हो रही है... बोलिए',
      previewTitle: 'रिकॉर्ड किया गया नोट:',
      playBtn: 'सुनें',
      pauseBtn: 'रोकें',
      sendToDiagnoseBtn: 'जांच के लिए भेजें (AI Crop Clinic)',
      savedListTitle: 'हाल ही में रिकॉर्ड किए गए नोट:',
      noRecordings: 'अभी तक कोई वॉयस नोट सुरक्षित नहीं है।',
      clearBtn: 'सभी हटाएं',
      justNow: 'अभी-अभी',
    },
  },
  bn: {
    common: {
      appName: 'FasalSetu',
      appHindi: 'ফসল সেতু',
      farmerHelp: 'কৃষক সহায়তা',
      guideBtn: 'নির্দেশিকা',
      themeToggle: 'থিম পরিবর্তন',
      lightMode: 'দিন (Light)',
      darkMode: 'রাত (Dark)',
      backBtn: 'ফিরে যান',
      backHome: '← হোম পেজে ফিরুন',
      tryAgain: 'আবার চেষ্টা করুন',
      errorTitle: 'পরীক্ষা সম্পন্ন করা যায়নি',
      loading: 'অনুগ্রহ করে অপেক্ষা করুন...',
      close: 'বন্ধ করুন',
    },
    home: {
      heroTitle: 'ফসলের রোগ নির্ণয় করুন ও স্থানীয় আবহাওয়া পরামর্শ পান।',
      heroDesc: 'আক্রান্ত পাতার ছবি তুলে বা মুখে বলে চটপট সমাধান পান, এবং আপনার এলাকার আবহাওয়াভিত্তিক সেচ ও রোগবালাই পরামর্শ জানুন।',
      checkCropBtn: 'আমার ফসল পরীক্ষা করুন (ছবি / ভয়েস)',
      advisoryBtn: 'আবহাওয়া ও কৃষি পরামর্শ (জেলা অনুযায়ী)',
      guideBtn: 'নতুনদের নির্দেশিকা ও ফিল্ড রেকর্ডার',
      footerText: 'ভারতীয় কৃষকদের জন্য বিশেষভাবে তৈরি | উজ্জ্বল সূর্যালোক ও রাতের অন্ধকার উভয় ক্ষেত্রেই সুস্পষ্ট',
    },
    diagnose: {
      title: 'ফসলের রোগ পরীক্ষা',
      subtitle: 'দ্রুত ও সহজ সমাধান',
      selectMode: 'পদ্ধতি বেছে নিন:',
      photoTab: 'ছবি (Photo)',
      voiceTab: 'আওয়াজ (Voice)',
      takePhoto: 'পাতার ছবি তুলুন',
      photoSub: 'ক্যামেরা খুলুন বা গ্যালারি থেকে বেছে নিন',
      orVoice: 'অথবা মুখে বলে জানান',
      voiceSub: 'নিজের ভাষায় সমস্যা রেকর্ড করুন',
      recording: 'বলুন... আমরা শুনছি',
      stopRecording: 'রেকর্ডিং সমাপ্ত করুন',
      analyzing: 'ফসলের পরীক্ষা চলছে...',
      waitNote: '৩ থেকে ৫ সেকেন্ড সময় লাগতে পারে',
      healthyTag: 'সুস্থ ফসল',
      diseaseTag: 'রোগের লক্ষণ',
      confidenceLabel: 'নির্ভরযোগ্যতা:',
      confidenceHigh: 'উচ্চ (High)',
      confidenceModerate: 'মাঝারি (Moderate)',
      confidenceLow: 'কম (Low)',
      recommendationTitle: 'কৃষক ভাইদের জন্য সমাধান:',
      replayAudio: 'আবার শুনুন',
      checkAnother: 'অন্য ফসল পরীক্ষা করুন',
      errorTitle: 'পরীক্ষা সম্পন্ন করা যায়নি',
      errorDesc: 'আমরা আপনার ফসলের সমস্যা শনাক্ত করতে পারিনি, অনুগ্রহ করে আবার চেষ্টা করুন।',
      stagedAudioAlert: 'ফিল্ড রেকর্ডার থেকে ভয়েস নোট লোড হয়েছে।',
      clearStagedAudio: 'মুছে ফেলুন',
      diagnoseBtn: 'পরীক্ষা করুন',
    },
    advisory: {
      title: 'আবহাওয়া ও কৃষি পরামর্শ',
      subtitle: 'আপনার এলাকার নির্ভরযোগ্য পূর্বাভাস',
      step1Title: 'ধাপ ১: রাজ্য নির্বাচন করুন',
      step2Title: 'ধাপ ২: জেলা নির্বাচন করুন',
      step3Title: 'ধাপ ৩: ফসল নির্বাচন করুন',
      selectState: 'রাজ্য বেছে নিন',
      selectDistrict: 'জেলা বেছে নিন',
      selectCrop: 'ফসল বেছে নিন',
      nextBtn: 'পরবর্তী ধাপ',
      changeBtn: 'পরিবর্তন',
      getAdvisory: 'আবহাওয়া ও কৃষি পরামর্শ পান',
      analyzing: 'আবহাওয়ার তথ্য ও পরামর্শ প্রস্তুত হচ্ছে...',
      waitNote: '৩ থেকে ৫ সেকেন্ড সময় লাগতে পারে',
      weatherConditions: 'বর্তমান আবহাওয়া',
      advisoryHeader: 'কৃষকদের জন্য সময়োপযোগী পরামর্শ:',
      replayAudio: 'পরামর্শ বাংলায় শুনুন',
      checkAnother: 'অন্য জেলা বা ফসল দেখুন',
      temp: 'তাপমাত্রা',
      humidity: 'আর্দ্রতা',
      wind: 'বাতাসের গতি',
      rainChance: 'বৃষ্টির সম্ভাবনা',
      errorTitle: 'পরামর্শ পাওয়া যায়নি',
      errorDesc: 'আবহাওয়ার তথ্য আনতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।',
    },
    guidance: {
      modalTitle: 'কৃষক নির্দেশিকা ও সহায়তা',
      tabGuide: 'নির্দেশিকা',
      tabAccessibility: 'সহায়তা (Accessibility)',
      tabRecorder: 'ফিল্ড রেকর্ডার',
      guideTitle1: '১. পাতার স্পষ্ট ছবি কীভাবে তুলবেন?',
      guideTip1: 'মোবাইল ক্যামেরা আক্রান্ত পাতা থেকে ৬-৮ ইঞ্চি দূরে রাখুন। ভালো আলোতে ছবি তুলুন যাতে পাতার দাগ পরিষ্কার দেখা যায়। ঝাপসা ছবি তুলবেন না।',
      guideTitle2: '২. মুখে বলে কীভাবে পরীক্ষা করবেন?',
      guideTip2: 'মাইক বোতাম চেপে নিজের ভাষায় বলুন—যেমন "টমেটো গাছের পাতা হলুদ হয়ে কালো দাগ পড়ছে।" তারপর রেকর্ডিং শেষ করুন।',
      guideTitle3: '৩. আবহাওয়া ও সেচ পরামর্শ কীভাবে নেবেন?',
      guideTip3: 'রাজ্য, জেলা এবং ফসল নির্বাচন করুন। বর্তমান তাপমাত্রা ও বৃষ্টির পূর্বাভাসের ভিত্তিতে সেচ ও কীটনাশক স্প্রে করার সঠিক সময় জানানো হবে।',
      listenSpokenGuide: 'নির্দেশিকা বাংলায় শুনুন',
      playingAudio: 'অডিও চলছে...',
      accessTitle: 'সুবিধা ও সহজ ব্যবহার',
      themeModeTitle: 'ডার্ক মোড (নাইট ভিশন)',
      themeModeDesc: 'কম আলোয় বা সন্ধ্যার সময় চোখের আরাম এবং ব্যাটারি সাশ্রয় করতে ডার্ক মোড অন করুন।',
      speechTitle: 'ভয়েস রিডআউট (মুখে শুনে বোঝা)',
      speechDesc: 'পড়তে সমস্যা হলে লাউডস্পিকার বোতাম চেপে যে কোনো পরামর্শ ও ফলাফল মুখে শুনতে পারেন।',
      largeTargetTitle: 'বড় মাপের টাচ বাটন',
      largeTargetDesc: 'ক্ষেতে কাজের সময় সহজে আঙুল ছোঁয়ানোর জন্য প্রতিটি বোতাম বড় ও স্পষ্ট করা হয়েছে।',
      motionTitle: 'শান্ত ও সহজ ডিজাইন',
      motionDesc: 'অপ্রয়োজনীয় অ্যানিমেশন বর্জন করে চোখের জন্য আরামদায়ক ইন্টারফেস।',
    },
    recorder: {
      title: 'ফিল্ড অডিও রেকর্ডার (নিজের ভয়েস নোট সংরক্ষণ করুন)',
      desc: 'জমিতে থাকাকালীন যে কোনো লক্ষণ বা সমস্যা নিজের মুখে রেকর্ড করে রাখুন অথবা সরাসরি পরীক্ষার জন্য পাঠান।',
      categoryLabel: 'সমস্যার ধরন বেছে নিন:',
      catLeafDisease: 'পাতার রোগ (Leaf Disease)',
      catPest: 'কীটপতঙ্গ ও পোকা (Pests)',
      catWeather: 'সেচ ও আবহাওয়া (Weather/Irrigation)',
      catGeneral: 'সাধারণ নোট (General Note)',
      startBtn: 'মাইক চেপে কথা বলুন',
      stopBtn: 'রেকর্ডিং সমাপ্ত করুন',
      recordingNow: 'রেকর্ডিং চলছে... বলুন',
      previewTitle: 'রেকর্ড করা নোট:',
      playBtn: 'শুনুন',
      pauseBtn: 'থামুন',
      sendToDiagnoseBtn: 'রোগ পরীক্ষার জন্য পাঠান (AI Clinic)',
      savedListTitle: 'সাম্প্রতিক রেকর্ড করা নোট:',
      noRecordings: 'এখনও কোনো ভয়েস নোট সংরক্ষিত হয়নি।',
      clearBtn: 'সব মুছুন',
      justNow: 'এইমাত্র',
    },
  },
  en: {
    common: {
      appName: 'FasalSetu',
      appHindi: 'फसल सेतु',
      farmerHelp: 'Farmer Help',
      guideBtn: 'Guide',
      themeToggle: 'Toggle Theme',
      lightMode: 'Day (Light)',
      darkMode: 'Night (Dark)',
      backBtn: 'Go Back',
      backHome: '← Back to Home',
      tryAgain: 'Try Again',
      errorTitle: 'Diagnosis Incomplete',
      loading: 'Please wait...',
      close: 'Close',
    },
    home: {
      heroTitle: 'Diagnose crop illness & get weather advice.',
      heroDesc: 'Take a picture of an unhealthy leaf or describe symptoms by voice for instant clinical treatment, and check real-time hyperlocal weather advisories.',
      checkCropBtn: 'Check My Crop (Photo / Voice)',
      advisoryBtn: 'Weather Advisory (By District)',
      guideBtn: 'Startup Guide & Field Recorder',
      footerText: 'Built for Indian agriculture | Sunlight & Dark Mode ready',
    },
    diagnose: {
      title: 'Crop Diagnosis',
      subtitle: 'Fast treatment plan',
      selectMode: 'Choose Diagnosis Mode:',
      photoTab: 'Photo',
      voiceTab: 'Voice',
      takePhoto: 'Take Leaf Photo',
      photoSub: 'Open camera or pick from gallery',
      orVoice: 'Speak Crop Symptoms',
      voiceSub: 'Describe the issue in your own language',
      recording: 'Listening... speak clearly',
      stopRecording: 'Finish Recording',
      analyzing: 'Analyzing crop condition...',
      waitNote: 'Takes 3 to 5 seconds',
      healthyTag: 'Healthy Crop',
      diseaseTag: 'Disease Detected',
      confidenceLabel: 'Confidence:',
      confidenceHigh: 'High',
      confidenceModerate: 'Moderate',
      confidenceLow: 'Low',
      recommendationTitle: 'Recommended Farmer Treatment Protocol:',
      replayAudio: 'Listen to Advice',
      checkAnother: 'Check Another Crop',
      errorTitle: 'Diagnosis Incomplete',
      errorDesc: 'Could not diagnose this sample. Please try again with clear lighting.',
      stagedAudioAlert: 'Voice note loaded from Field Recorder.',
      clearStagedAudio: 'Clear',
      diagnoseBtn: 'Diagnose',
    },
    advisory: {
      title: 'Farm Weather Advisory',
      subtitle: 'Hyperlocal district forecast',
      step1Title: 'Step 1: Select State',
      step2Title: 'Step 2: Select District',
      step3Title: 'Step 3: Select Crop',
      selectState: 'Select State',
      selectDistrict: 'Select District',
      selectCrop: 'Select Crop',
      nextBtn: 'Next Step',
      changeBtn: 'Change',
      getAdvisory: 'Get Farm Advisory',
      analyzing: 'Fetching weather & preparing advisory...',
      waitNote: 'Takes 3 to 5 seconds',
      weatherConditions: 'Current Weather Conditions',
      advisoryHeader: 'Localized Agronomic Advisory:',
      replayAudio: 'Listen to Advisory',
      checkAnother: 'Check Another District / Crop',
      temp: 'Temperature',
      humidity: 'Humidity',
      wind: 'Wind Speed',
      rainChance: 'Rain Probability',
      errorTitle: 'Advisory Unavailable',
      errorDesc: 'Could not retrieve weather forecast. Please try again.',
    },
    guidance: {
      modalTitle: 'Farmer Guide & Accessibility',
      tabGuide: 'Guide',
      tabAccessibility: 'Accessibility',
      tabRecorder: 'Field Recorder',
      guideTitle1: '1. How to capture clear leaf photos?',
      guideTip1: 'Hold your phone camera 6 to 8 inches from the affected leaf in bright daylight. Ensure the lesion or spotting is in focus. Avoid blurry motion.',
      guideTitle2: '2. How to diagnose by voice note?',
      guideTip2: 'Tap the mic button and speak in your language—describe whether leaves have dark spots, wilting, or pest damage. Tap finish when done.',
      guideTitle3: '3. How to get hyperlocal weather advice?',
      guideTip3: 'Select your state, district, and crop. The app uses real-time temperature, humidity, and rainfall probability to advise when to irrigate or spray.',
      listenSpokenGuide: 'Listen to Spoken Guide',
      playingAudio: 'Playing audio...',
      accessTitle: 'Accessibility & Display Tools',
      themeModeTitle: 'Dark Mode (Night Vision)',
      themeModeDesc: 'Reduces eye strain in dim evening light or shade and saves battery life.',
      speechTitle: 'Voice Readout (Spoken Audio)',
      speechDesc: 'Every diagnosis and advisory can be listened to in spoken audio for low-literacy farmers.',
      largeTargetTitle: 'Large Touch Targets',
      largeTargetDesc: 'All buttons are sized ≥44pt with generous spacing for easy tapping in the field.',
      motionTitle: 'Calm Motion',
      motionDesc: 'Smooth, non-elastic transitions with reduced motion alternatives.',
    },
    recorder: {
      title: 'Field Audio Recorder (Record Crop Notes)',
      desc: 'Quickly record voice notes of crop symptoms, pest sightings, or observations while walking the field. Save them locally or send directly to AI diagnosis.',
      categoryLabel: 'Select Note Category:',
      catLeafDisease: 'Leaf Disease',
      catPest: 'Pests & Insects',
      catWeather: 'Irrigation & Weather',
      catGeneral: 'General Field Note',
      startBtn: 'Tap Mic to Record',
      stopBtn: 'Finish Recording',
      recordingNow: 'Recording active... speak now',
      previewTitle: 'Recorded Voice Note:',
      playBtn: 'Play',
      pauseBtn: 'Pause',
      sendToDiagnoseBtn: 'Send to AI Crop Clinic',
      savedListTitle: 'Recent Field Voice Notes:',
      noRecordings: 'No voice notes recorded yet.',
      clearBtn: 'Clear All',
      justNow: 'Just now',
    },
  },
};
