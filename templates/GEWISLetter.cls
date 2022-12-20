%% GEWIS Letter Tex style v2.0
%% Stijl - Gijs de Man

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{GEWISLetter}[2022/29/07 GEWIS Letter Class]

\LoadClassWithOptions{GEWISDocument}
\RequirePackage{GEWISLetter}

% Version control
\def\@majorVersion{1}
\documentMajorVersion{1}
\@letterStyMajorVersion{2}
\newcommand{\letterMajorVersion}[1]{
	\ifnum\numexpr#1\relax=\numexpr\@majorVersion\relax\else
	\ClassError{GEWISLetter}{Major version mismatch. Check corporate identity for more information.}
	\fi
}

\usepackage{ifthen} % Allow if-statements
\usepackage{fontawesome} % Glyphs of association details in header
\usepackage{multirow} % Tabular alignment over multiple rows
\usepackage[gen]{eurosym}

% Deprecated packages
\usepackage{array} % Additional tabular column options
\usepackage[useregional]{datetime2}

% Font settings
\usepackage[default]{lato} % Loading the actual T1 font
\pdfmapfile{=lato.map}
\pdfmapfile{=fontawesome.map}

% Create toggle for using 
\newtoggle{printaddress}
\togglefalse{printaddress}
\DeclareOption{printaddress}{
	\toggletrue{printaddress}
}

\newtoggle{invoice}
\togglefalse{invoice}
\DeclareOption{invoice}{
	\toggletrue{invoice}
}

\newtoggle{quote}
\togglefalse{quote}
\DeclareOption{quote}{
	\toggletrue{quote}
}
\ProcessOptions\relax

%%
%% Language options only used in letter
%%
\newcommand\@languageStudyAssociation{Study association GEWIS}
\newcommand\@languageEindhovenUniversity{Eindhoven University of Technology}
\newcommand\@languageAttention{Attn.}
\newcommand\@languageYourReference{PO number}
\newcommand\@languageMyReference{Our reference}
\iftoggle{invoice}{\renewcommand\@languageMyReference{Invoice number}}\relax
\iftoggle{quote}{\renewcommand\@languageMyReference{Quote number}}\relax
\newcommand\@languageDate{Date}
\newcommand\@languageDueDate{Due date}
\newcommand\@languageCustomerNumber{Customer number}
\newcommand\@languageSubject{Subject}
\newcommand\@languageNetherlands{The Netherlands}
\newcommand\@languageVAT{VAT}
\newcommand\@languageInvoice{Invoice}
\newcommand\@languageQuote{Quote}
\newcommand\@languageBottomText{\small Please pay within 30 days (before \@featureDueDate) to account number \@senderIBAN\ in the name of \@senderName\ referring to the invoice number \@myReference.}
\newcommand\@languageConcerning{Concerning}

\iftoggle{dutch}{
	\renewcommand\@languageStudyAssociation{Studievereniging GEWIS}
	\renewcommand\@languageEindhovenUniversity{Technische Universiteit Eindhoven}
	\renewcommand\@languageAttention{T.a.v.}
	\renewcommand\@languageYourReference{Ordernummer}
	\iftoggle{invoice}{\renewcommand\@languageMyReference{Factuurnummer}}\relax
	\iftoggle{quote}{\renewcommand\@languageMyReference{Offertenummer}}\relax
	\renewcommand\@languageDate{Datum}
	\renewcommand\@languageDueDate{Vervaldatum}
	\renewcommand\@languageCustomerNumber{Debiteurnummer}
	\renewcommand\@languageSubject{Onderwerp}
	\renewcommand\@languageNetherlands{Nederland}
	\renewcommand\@languageVAT{BTW}
	\renewcommand\@languageInvoice{Factuur}
	\renewcommand\@languageQuote{Offerte}
	\renewcommand\@languageBottomText{\small Gelieven te betalen binnen 30 dagen (voor \@featureDueDate) op rekeningnummer \@senderIBAN\ ten name van \@senderName\ onder vermelding van factuurnummer \@myReference.}
	\renewcommand\@languageConcerning{Betreft}
}

% Put all information in header of letter
\renewcommand\@GEWISheader{
	\color{GEWISDarkGray}
	\scriptsize
	\begin{tabular}{@{}p{2.75mm} @{\hspace{2.45mm}}>{\raggedright\arraybackslash}p{35mm}}
		& \textbf{\textit{\@languageStudyAssociation}}\\
		& \textit{\@languageEindhovenUniversity}\\
		& \\
		& \\
		& MF 3.155\\
		& De Groene Loper 5\\
		& 5612AZ Eindhoven\\
		& \@languageNetherlands
	\end{tabular}
	\hspace{10mm}
	\begin{tabular}{@{}>{\raggedleft\arraybackslash}p{5mm} @{\hspace{4mm}}>{\raggedright\arraybackslash}p{35mm}}
		\multirow{2}{*}{\faicon{envelope}} 	& Postbus 513\\
											& 5600MB Eindhoven\\
		&\\
		\faicon{phone} 	& \@senderPhone\\
		\faicon{at}		& \href{mailto:\@senderMail}{\@senderMail}\relax\\
		& \\
		\faicon{bank}			& \@senderIBAN\\
		{\tiny\bfseries \@languageVAT} 	& NL810074230B01\\
		{\tiny\bfseries KvK} 	& 40237787
	\end{tabular}
}

%% Begin with printing all details
\AtBeginDocument{%
	\iftoggle{printaddress}{%
		\begin{minipage}[c][30mm][t]{0.5\linewidth}%
			\iftoggle{invoice}{%
				\textbf{\@languageInvoice}%
			}{%
				\iftoggle{quote}{%
					\textbf{\@languageQuote}%
				}{%
					\textbf{\@letterType}%
				}%
			}\\%
			\@recipient\\%
			\ifthenelse{\equal{\@attention}{}}{}{\@attention\\}
			\@street\\%
			\@postalCode\ \@city%
			\ifthenelse{\equal{\@country}{}}{}{\\\@country}
		\end{minipage}%
		\par%
		\vspace{1cm}%
	}\relax%
	\iftoggle{invoice}{
		{\huge\textbf{\@languageInvoice}}%
		\vspace{0.5cm}%
	
		\printFeatures%
		\vspace{0.5cm}%
		
	}{%
		\iftoggle{quote}{%
			{\huge\textbf{\@languageQuote}}\\%
			\vspace{0.5cm}%
			
			\printFeatures%
			\vspace{0.5cm}%
			
		}{%
			\@senderName, \@letterDate.\\%
			\@languageConcerning: \textit{\@letterSubject}%
			\vspace{2em}%
			
		}%
	}%
}





\AtEndDocument{
	\iftoggle{invoice}{
		\vfill
		\@languageBottomText
	}
}

\newcommand{\printFeatures}{
	\begin{tabular}{@{}p{3cm}@{}p{3cm}@{}p{2.5cm}@{}p{2.5cm}@{}p{\textwidth-11cm}@{}}
		\textbf{\@languageMyReference} & \textbf{\@languageYourReference} & \textbf{\@languageDate} & \textbf{\@languageDueDate} & \textbf{\@languageCustomerNumber} \\
		\@myReference & \@yourReference & \@featureDate & \@featureDueDate & \@debtorNumber
	\end{tabular}
}


% Variabeles for contact details
\newcommand\@senderName{\@languageStudyAssociation}
\newcommand\@senderMail{board@gewis.nl}
\newcommand\@senderPhone{+31 40 247 2815}
\newcommand\@senderWeb{www.gewis.nl}
\newcommand\@senderIBAN{NL22 ABNA 0528 1959 13}

\newcommand\@recipient{Recipient}
\newcommand\@attention{}
\newcommand\@street{Straat}
\newcommand\@postalCode{Postcode}
\newcommand\@city{Stad}
\newcommand\@country{}

\newcommand\@yourReference{-}
\newcommand\@myReference{-}
\newcommand\@letterDate{-}
\newcommand\@featureDate{-}
\newcommand\@featureDueDate{-}
\newcommand\@debtorNumber{-}
\newcommand\@letterSubject{-}
\newcommand\@letterType{}

\newcommand\setSenderName[1]{\renewcommand\@senderName{#1}}
\newcommand\setSenderMail[1]{\renewcommand\@senderMail{#1}}
\newcommand\setSenderPhone[1]{\renewcommand\@senderPhone{#1}}
\newcommand\setSenderWeb[1]{\renewcommand\@senderWeb{#1}}


%%
%% Setting details of the letter
%% 
\newcommand\setYourreference[1]{\renewcommand\@yourReference{#1}}
\newcommand\setMyreference[1]{\renewcommand\@myReference{#1}}
\newcommand\setDebtorNumber[1]{\renewcommand\@debtorNumber{#1}}

\newcounter{meetingDay}
\newcounter{meetingMonth}
\newcounter{meetingYear}
\newcounter{agendaDay}
\newcounter{agendaMonth}
\newcounter{agendaYear}
\newcommand\@@meetingMonth{}
\newcommand\@@agendaMonth{}
\newcommand\@@agendaDay{}
\newcommand\setDate[3]{%
	\setcounter{meetingDay}{#1}%
	\setcounter{meetingMonth}{#2}%
	\setcounter{meetingYear}{#3}%
	\renewcommand\@letterDate{\DTMdisplaydate{\themeetingYear}{\themeetingMonth}{\themeetingDay}{-1}}%
	\renewcommand\@featureDate{\themeetingDay-\themeetingMonth-\themeetingYear}
}%
\newcommand\setDueDate[3]{%
	\renewcommand\@featureDueDate{#1-#2-#3}
}%
\newcommand\setSubject[1]{\renewcommand\@letterSubject{#1}}
\newcommand\setType[1]{\renewcommand\@letterType{#1}}

\newcommand\setRecipient[1]{\renewcommand\@recipient{#1}}
\newcommand\setAttn[1]{\renewcommand\@attention{\@languageAttention\ #1}}
\newcommand\setStreet[1]{\renewcommand\@street{#1}}
\newcommand\setPostcode[1]{\renewcommand{\@postalCode}{#1}}
\newcommand\setCity[1]{\renewcommand\@city{#1}}
\newcommand\setCountry[1]{\renewcommand\@country{#1}}