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
  calendarPage: {
    title: "Kalender",
    subtitle: "Fristen und Termine im Überblick",
    views: {
      month: "Monat",
      week: "Woche",
      day: "Tag",
    },
    viewSwitch: "Ansicht wählen",
    navigation: {
      month: { previous: "Vorheriger Monat", next: "Nächster Monat" },
      week: { previous: "Vorherige Woche", next: "Nächste Woche" },
      day: { previous: "Vorheriger Tag", next: "Nächster Tag" },
    },
    weekTitle: "KW {week} · {range}",
    openDay: "Tagesansicht für {date} öffnen",
    noEntries: "Keine Aufgaben oder Projekte an diesem Tag.",
    today: "Heute",
    legend: "Legende:",
    legendType: "Typ",
    project: "Projekt",
    task: "Aufgabe",
    weekdays: [
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag",
    ],
    status: {
      overdue: "Überfällig",
      inProgress: "In Bearbeitung",
      open: "Offen",
      done: "Abgeschlossen",
    },
    progress: "{done} von {total} Aufgaben erledigt",
    more: "+{count} weitere",
    moreTitle: "Alle Einträge am {date}",
    reopenDialog: {
      title: "Aufgabe wieder öffnen?",
      description:
        "„{title}“ ist abgeschlossen. Möchtest du die Aufgabe wirklich wieder auf offen stellen?",
      confirm: "Wieder öffnen",
      cancel: "Abbrechen",
    },
    footer: {
      overdue: "Fällig am {date} · seit {days} Tagen",
      overdueYesterday: "Fällig am {date} · seit gestern",
      today: "Heute fällig",
      soon: "Fällig am {date} · in {days} Tagen",
      tomorrow: "Fällig am {date} · morgen",
      later: "Fällig am {date}",
      done: "Abgeschlossen am {date}",
      doneWithoutDate: "Abgeschlossen",
    },
  },
  timeTrackingPage: {
    title: "Zeiterfassung",
    subtitle: "Deine Arbeitszeit pro Tag und Aufgabe erfassen",
    weekNavigation: {
      previous: "Vorherige Woche",
      next: "Nächste Woche",
      today: "Heute",
      label: "KW {week} · {range}",
      openPicker: "Woche auswählen, angezeigt: {label}",
      weekNumberHeader: "KW",
      navigationLabel: "Wochennavigation",
      weekNumberLabel: "Kalenderwoche",
    },
    status: {
      title: "Wochenstatus KW {week}",
      ofTarget: "von {target} Soll",
      progress: "Wochensoll erreicht",
      today: "Heute erfasst",
      entryCount: { one: "1 Eintrag", other: "{count} Einträge" },
    },
    form: {
      createTitle: "Zeit buchen",
      editTitle: "Eintrag bearbeiten",
      required: "Pflichtfeld",
      project: "Projekt",
      projectPlaceholder: "Projekt suchen",
      projectEmpty: "Kein Projekt gefunden.",
      task: "Aufgabe",
      selectProjectFirst: "Wähle zuerst ein Projekt aus.",
      noTasks: "Für dieses Projekt gibt es noch keine Aufgaben.",
      taskDone: "Aufgabe ist abgeschlossen – trotzdem buchen?",
      date: "Datum",
      duration: "Dauer",
      hours: "Stunden",
      minutes: "Minuten",
      total: "Gesamt: {duration}",
      description: "Beschreibung (optional)",
      descriptionPlaceholder: "Was hast du gemacht?",
      submit: "{duration} buchen",
      reset: "Zurücksetzen",
      save: "Änderungen speichern",
      delete: "Eintrag löschen",
      cancel: "Abbrechen",
      futureWeek: "Für zukünftige Wochen kannst du noch keine Zeit buchen.",
      validation: {
        project: "Wähle ein Projekt aus, um Zeit zu buchen.",
        task: "Wähle eine Aufgabe aus.",
        duration: "Gib eine Dauer von mindestens 1 Minute ein.",
        durationInvalid: "Gib ganze Stunden und 0 bis 59 Minuten ein.",
        description: "Die Beschreibung darf höchstens {max} Zeichen lang sein.",
        dailyLimit:
          "Mehr als {hours} Stunden an einem Tag – bitte prüfe deine Eingabe.",
      },
    },
    overview: {
      title: "Wochenübersicht",
      export: "Woche exportieren",
      projectTask: "Projekt / Aufgabe",
      total: "Summe",
      expand: "{project} aufklappen",
      collapse: "{project} zuklappen",
      dayTotal: "Gesamt pro Tag",
      target: "Soll",
      difference: "Differenz",
      today: "heute",
      empty:
        "Diese Woche noch keine Zeiten gebucht. Wähle oben ein Projekt und buche deine erste Zeit.",
      showEntries: "{task}, {date}, {duration} – Einträge anzeigen",
      addEntry: "{task}, {date} – Zeit buchen",
    },
    popover: {
      title: "{task} · {date}",
      close: "Schließen",
      edit: "Bearbeiten",
      delete: "Löschen",
      noDescription: "Keine Beschreibung",
      confirmDelete: "{duration}-Eintrag löschen?",
      confirm: "Löschen",
      keep: "Behalten",
      total: "Gesamt: {duration}",
      add: "Eintrag hinzufügen",
    },
    toast: {
      created: "{duration} gebucht",
      updated: "Änderungen gespeichert",
      deleted: "Eintrag gelöscht",
      undo: "Rückgängig",
      undone: "Rückgängig gemacht",
      error: "Das hat nicht geklappt. Bitte versuche es erneut.",
    },
    csv: {
      date: "Datum",
      project: "Projekt",
      projectId: "Projekt-ID",
      task: "Aufgabe",
      duration: "Dauer (h:mm)",
      minutes: "Dauer (Minuten)",
      description: "Beschreibung",
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
  calendarPage: typeof de.calendarPage
  timeTrackingPage: typeof de.timeTrackingPage
  dashboard: typeof de.dashboard
}

export default de satisfies Dictionary
