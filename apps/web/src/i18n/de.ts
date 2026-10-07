const de = {
  sidebar: {
    overview: "Übersicht",
    planning: "Planung",
    dashboard: "Dashboard",
    projects: "Projekte",
    tasks: "Aufgaben",
    companyProfile: "Kundenprofile",
    settings: "Einstellungen",
    timeTracking: "Zeiterfassung",
    calendar: "Kalender",
  },
  user: {
    account: "Konto",
    logout: "Abmelden",
  },
  loginForm: {
    title: "Anmeldung",
    emailLabel: "E-Mail",
    passwordLabel: "Passwort",
    submitButton: "Anmelden",
    invalidCredentials: "E-Mail oder Passwort ist falsch.",
    genericError:
      "Anmeldung derzeit nicht möglich. Bitte versuche es später erneut.",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
    rememberAccount: "Konto merken",
    subtitle: "Schön, dich wiederzusehen! Melde dich an, um fortzufahren.",
  },

  projectsPage: {
    title: "Projekte",
    subtitle: "Hier findest du alle Projekte wieder",
    searchPlaceholder: "Projekte oder Kunden suchen",
    newProject: "Neues Projekt",
    pagination: {
      of: "von",
      previous: "Vorherige Seite",
      next: "Nächste Seite",
    },
    statusFilterLabel: "Nach Status filtern",
    filters: {
      all: "Alle",
      active: "Aktiv",
      created: "Erstellt",
      completed: "Abgeschlossen",
    },
  },

  tasksPage: {
    title: "Meine Aufgaben",
    openTasks: "offene Aufgaben",
    searchPlaceholder: "Aufgaben suchen",
    newTask: "Neue Aufgabe",
    noResults: "Keine Aufgaben gefunden.",
    hoursUnit: "Std.",
    summary: {
      today: "Heute erfasst",
      week: "Diese Woche erfasst",
    },
    timer: {
      running: "Läuft:",
      stop: "Stoppen",
      start: "Zeiterfassung starten",
      stopTask: "Zeiterfassung stoppen",
      locked: "Es läuft bereits eine Zeiterfassung",
    },
    groups: {
      overdue: "Überfällig",
      today: "Heute fällig",
      thisWeek: "Diese Woche",
      later: "Später",
    },
    columns: {
      task: "Aufgabe",
      project: "Projekt",
      customer: "Kunde",
      priority: "Priorität",
      dueDate: "Fällig am",
      time: "Zeit",
      action: "Aktion",
    },
    priority: {
      high: "Hoch",
      medium: "Mittel",
      low: "Niedrig",
    },
  },

  customerContactsPage: {
    title: "Kundenkontakte",
    subtitle: "Hier findest du alle Kundenkontakte",
    searchPlaceholder: "Kunde oder Ansprechpartner suchen",
    newCustomerContact: "Neuer Kundenkontakt",
    pagination: {
      of: "von",
      previous: "Vorherige Seite",
      next: "Nächste Seite",
    },
    detail: {
      back: "Zurück zur Übersicht",
      breadcrumbLabel: "Brotkrümelnavigation",
      editProfile: "Profil bearbeiten",
      branches: "Filialen",
      branchesSubtitle:
        "Übersicht der Standorte mit Adresse und Kontaktinformationen.",
      contactPersons: "Ansprechpartner",
      note: "Bemerkung",
      noContactPersons: "Keine Ansprechpartner vorhanden.",
      noNote: "Keine Bemerkung vorhanden.",
      columns: {
        name: "Ansprechpartner",
        position: "Position",
        phone: "Telefonnummer",
        email: "E-Mail",
      },
    },
  },

  settingsPage: {
    title: "Profil Einstellungen",
    avatarHint: "Profilbild-Größe: 400px x 400px",
    uploadNew: "Neu hochladen",
    basic: {
      title: "Grundlegende Informationen",
      description:
        "Diese Angaben sind für andere Teammitglieder in deinem Profil sichtbar.",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail-Adresse",
      about: "Über mich",
      aboutPlaceholder: "Erzähle etwas über dich...",
    },
    more: {
      title: "Weitere Informationen",
      description:
        "Ergänze deine Kontaktdaten und deine Position im Unternehmen.",
      phone: "Telefonnummer",
      position: "Position",
      address: "Adresse",
    },
    save: "Änderung speichern",
    saveError: "Speichern nicht möglich. Bitte versuche es später erneut.",
    validation: {
      required: "Dieses Feld ist erforderlich.",
      invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
      aboutTooLong: "Der Text darf höchstens 300 Zeichen lang sein.",
      invalidPhone: "Bitte gib eine gültige Telefonnummer ein.",
      passwordTooShort: "Das Passwort muss mindestens 8 Zeichen haben.",
      passwordMismatch: "Die neuen Passwörter stimmen nicht überein.",
    },
    successDialog: {
      title: "Erfolgreich gespeichert!",
      profileDescription: "Folgende Änderungen wurden gespeichert:",
      passwordDescription: "Dein Passwort wurde erfolgreich geändert.",
      close: "Schließen",
    },
    notifications: {
      title: "Benachrichtigungseinstellung",
      description:
        "Lege fest, worüber du per E-Mail informiert werden möchtest.",
      newProjects: "Neue Projekte",
      newProjectsDescription:
        "Erhalte eine E-Mail, wenn ein neues Projekt angelegt wird.",
      newTasks: "Neue Aufgaben",
      newTasksDescription:
        "Erhalte eine E-Mail, wenn dir eine neue Aufgabe zugewiesen wird.",
      updates: "Updates und Ankündigungen",
      updatesDescription:
        "Erhalte E-Mails zu Neuerungen und wichtigen Ankündigungen.",
    },
    password: {
      title: "Passwort & Sicherheit",
      description:
        "Ändere dein Passwort regelmäßig, um dein Konto zu schützen. Es muss mindestens 8 Zeichen lang sein.",
      current: "Aktuelles Passwort",
      new: "Neues Passwort",
      confirm: "Neues Passwort bestätigen",
      submit: "Passwort ändern",
      invalidCurrent: "Das aktuelle Passwort ist falsch.",
      rejected: "Das neue Passwort erfüllt die Anforderungen nicht.",
    },
  },
  dashboard: {
    projectStats: {
      title: "Projektstatistiken",
      totalProjects: "Gesamtprojekte",
      completedProjects: "Abgeschlossene Projekte",
      ongoingProjects: "Laufende Projekte",
      overdueProjects: "Überfällige Projekte",
    },
    myProjects: {
      title: "Meine Projekte",
    },
    myTasks: {
      title: "Meine Aufgaben",
      noTasks: "Keine Aufgaben zu erledigen.",
    },
    weeklyWorkTime: {
      title: "Wöchentliche Arbeitszeit",
      totalHours: "Gesamtstunden",
      averageHoursPerDay: "Durchschnittliche Stunden pro Tag",
    },
    customerContacts: {
      title: "Kundenkontakte",
      noContacts: "Keine Kundenkontakte verfügbar.",
    },
  },
}

export type Dictionary = {
  sidebar: Record<keyof typeof de.sidebar, string>
  user: Record<keyof typeof de.user, string>
  loginForm: Record<keyof typeof de.loginForm, string>
  projectsPage: typeof de.projectsPage
  tasksPage: typeof de.tasksPage
  customerContactsPage: typeof de.customerContactsPage
  settingsPage: typeof de.settingsPage
  dashboard: typeof de.dashboard
}

export default de satisfies Dictionary
