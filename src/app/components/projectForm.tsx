// // components/ProjectForm.tsx
// 'use client';
// import type { Column, ProjectDoc } from '@/app/models/projects';
// import AddIcon from '@mui/icons-material/Add';
// import DeleteIcon from '@mui/icons-material/Delete';
// import {
//   Box,
//   Button,
//   Chip,
//   FormControlLabel,
//   Grid,
//   IconButton,
//   Paper,
//   Switch,
//   TextField,
//   Typography,
// } from '@mui/material';
// import axios from 'axios';
// import Image from 'next/image';
// import React, { useEffect, useState } from 'react';
// import { BlockMath } from 'react-katex';
// import { v4 as uuidv4 } from 'uuid';
// import { Project, Section, SubSection } from '../data/projectsData';
// import CollapsibleSection from './ColapsableComponent';

// type FormProps = {
//   initial?: Partial<ProjectDoc>;
//   onSaved?: (project: Project) => void;
//   submitLabel?: string;
//   submitMethod?: string;
// };

// function fileToDataUrl(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onerror = (e) => reject(e);
//     reader.onload = () => resolve(reader.result as string);
//     reader.readAsDataURL(file);
//   });
// }

// export default function ProjectForm({
//   initial = {},
//   onSaved,
//   submitLabel = 'Save',
//   submitMethod = 'POST',
// }: FormProps) {
//   const [id] = useState<string>(typeof initial._id === 'string' ? initial._id : '');
//   const [title, setTitle] = useState(initial.title ?? '');
//   const [visibility, setVisibility] = useState(initial.visibility ?? false);
//   const [description, setDescription] = useState(initial.description ?? '');
//   const [longDescription, setLongDescription] = useState(initial.longDescription ?? '');
//   const [technologies, setTechnologies] = useState<string[]>(initial.technologies ?? []);
//   const [techInput, setTechInput] = useState('');
//   const [features, setFeatures] = useState<string[]>(initial.features ?? []);
//   const [featureInput, setFeatureInput] = useState('');
//   const [challenges, setChallenges] = useState<string[]>(initial.challenges ?? []);
//   const [solutions, setSolutions] = useState<string[]>(initial.solutions ?? []);
//   const [image, setImage] = useState<string | undefined>(initial.image);
//   const [githubLink, setGithubLink] = useState(initial.githubLink ?? '');
//   const [liveLink, setLiveLink] = useState(initial.liveLink ?? '');
//   const [duration, setDuration] = useState(initial.duration ?? '');
//   const [teamSize, setTeamSize] = useState(initial.teamSize ?? '');
//   const [role, setRole] = useState(initial.role ?? '');
//   const [sections, setSections] = useState<Section[]>(initial.sections ?? []);
//   useEffect(() => {
//     // ensure sections have ids
//     setSections((s) =>
//       s.map((sec: Section) => ({
//         ...sec,
//         id: sec.id ?? uuidv4(),
//         subSections: sec.subSections ?? [],
//       }))
//     );
//   }, []); // run once

//   // Image selector (convert to data URL)
//   async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const dataUrl = await fileToDataUrl(file);
//     setImage(dataUrl);
//   }

//   function addTechnology() {
//     if (!techInput.trim()) return;
//     setTechnologies((t) => [...t, techInput.trim()]);
//     setTechInput('');
//   }
//   function removeTechnology(i: number) {
//     setTechnologies((t) => t.filter((_, idx) => idx !== i));
//   }
//   const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setVisibility(event.target.checked);
//   };
//   function addFeature() {
//     if (!featureInput.trim()) return;
//     setFeatures((f) => [...f, featureInput.trim()]);
//     setFeatureInput('');
//   }
//   function removeFeature(i: number) {
//     setFeatures((f) => f.filter((_, idx) => idx !== i));
//   }

//   function addSection() {
//     setSections((s) => [
//       ...s,
//       {
//         id: uuidv4(),
//         heading: 'New section',
//         content: [''],
//         image: undefined,
//         subSections: [],
//       },
//     ]);
//   }
//   function updateSection(idx: number, patch: Partial<Section>) {
//     setSections((s) => s.map((sec, i) => (i === idx ? { ...sec, ...patch } : sec)));
//   }
//   function removeSection(idx: number) {
//     setSections((s) => s.filter((_, i) => i !== idx));
//   }
//   // function addColumnToSection(secIdx: number) {
//   //   setSections((prev) =>
//   //     prev.map((section, index): Section => {
//   //       if (index !== secIdx) return section;

//   //       const newColumn: Column = {
//   //         id: uuidv4(),
//   //         type: 'text',
//   //         content: '',
//   //       };

//   //       return {
//   //         ...section,
//   //         columns: [...(section.columns ?? []), newColumn],
//   //       };
//   //     })
//   //   );
//   // }

//   function removeColumnFromSection(secIdx: number, colIdx: number) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               columns: sec.columns?.filter((_, j) => j !== colIdx),
//             }
//           : sec
//       )
//     );
//   }

//   const addColumnToSection = (si: number) => {
//     updateSection(si, {
//       columns: [
//         ...(sections[si].columns || []),
//         { id: uuidv4(), type: 'text', content: '', width: 50 },
//       ],
//     });
//   };

//   function addSubSection(secIdx: number) {
//     const sub = {
//       id: uuidv4(),
//       heading: 'New sub',
//       content: [''],
//       points: [],
//       image: undefined,
//     };
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx ? { ...sec, subSections: [...(sec.subSections ?? []), sub] } : sec
//       )
//     );
//   }

//   function addColumnSection(secIdx: number) {
//     const sub = {
//       id: uuidv4(),
//       heading: 'New sub',
//       content: [''],
//       points: [],
//       image: undefined,
//     };
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx ? { ...sec, subSections: [...(sec.subSections ?? []), sub] } : sec
//       )
//     );
//   }
//   function updateSubSection(secIdx: number, subIdx: number, patch: Partial<SubSection>) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               subSections: sec.subSections?.map((sub: SubSection, j: number) =>
//                 j === subIdx ? { ...sub, ...patch } : sub
//               ),
//             }
//           : sec
//       )
//     );
//   }
//   function removeSubSection(secIdx: number, subIdx: number) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               subSections: sec.subSections?.filter((_: SubSection, j: number) => j !== subIdx),
//             }
//           : sec
//       )
//     );
//   }

//   // section image upload (client side)
//   async function handleSectionImageChange(e: React.ChangeEvent<HTMLInputElement>, secIdx: number) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const dataUrl = await fileToDataUrl(file);
//     updateSection(secIdx, { image: dataUrl });
//   }
//   async function handleSubSectionEqationChange(
//     e: React.ChangeEvent<HTMLTextAreaElement>,
//     secIdx: number,
//     subIdx: number
//   ) {
//     updateSubSection(secIdx, subIdx, { equation: e.target.value });
//   }

//   async function handleSubSectionImageChange(
//     e: React.ChangeEvent<HTMLInputElement>,
//     secIdx: number,
//     subIdx: number
//   ) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const dataUrl = await fileToDataUrl(file);
//     updateSubSection(secIdx, subIdx, { image: dataUrl });
//   }

//   // add / remove content paragraph inside section
//   function updateSectionContent(secIdx: number, contentIdx: number, val: string) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               content: sec.content.map((c: string, j: number) => (j === contentIdx ? val : c)),
//             }
//           : sec
//       )
//     );
//   }
//   function addSectionParagraph(secIdx: number) {
//     setSections((s) =>
//       s.map((sec, i) => (i === secIdx ? { ...sec, content: [...sec.content, ''] } : sec))
//     );
//   }
//   function removeSectionParagraph(secIdx: number, contentIdx: number) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               // eslint-disable-next-line @typescript-eslint/no-explicit-any
//               content: sec.content.filter((_: any, j: number) => j !== contentIdx),
//             }
//           : sec
//       )
//     );
//   }

//   // sub-section points handling
//   function addPoint(secIdx: number, subIdx: number, text = '') {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               // eslint-disable-next-line @typescript-eslint/no-explicit-any
//               subSections: sec.subSections?.map((sub: any, j: number) =>
//                 j === subIdx ? { ...sub, points: [...(sub.points ?? []), text] } : sub
//               ),
//             }
//           : sec
//       )
//     );
//   }
//   function updatePoint(secIdx: number, subIdx: number, pointIdx: number, text: string) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               subSections: sec.subSections?.map((sub: SubSection, j: number) =>
//                 j === subIdx
//                   ? {
//                       ...sub,
//                       points: sub.points?.map((p: string, k: number) =>
//                         k === pointIdx ? text : p
//                       ),
//                     }
//                   : sub
//               ),
//             }
//           : sec
//       )
//     );
//   }
//   function removePoint(secIdx: number, subIdx: number, pointIdx: number) {
//     setSections((s) =>
//       s.map((sec, i) =>
//         i === secIdx
//           ? {
//               ...sec,
//               subSections: sec.subSections?.map((sub: SubSection, j: number) =>
//                 j === subIdx
//                   ? {
//                       ...sub,
//                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                       points: sub.points?.filter((_: any, k: number) => k !== pointIdx),
//                     }
//                   : sub
//               ),
//             }
//           : sec
//       )
//     );
//   }

//   async function submit(e?: React.FormEvent, method = 'POST', id?: string) {
//     if (e) e.preventDefault();
//     const payload: Project = {
//       visibility,
//       title,
//       description,
//       longDescription,
//       technologies,
//       features,
//       challenges,
//       solutions,
//       image,
//       githubLink,
//       liveLink,
//       duration,
//       teamSize,
//       role,
//       sections,
//     };

//     try {
//       let res;
//       if (method === 'POST') {
//         res = await axios.post('/api/projects', payload);
//       } else {
//         res = await axios.put(`/api/projects/${id}`, payload);
//       }
//       if (onSaved) {
//         onSaved(res.data);
//       }
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//       console.error(err);
//       alert('Failed to save: ' + (err?.response?.data?.error || err?.message));
//     }
//   }

//   return (
//     <Paper sx={{ p: 3 }}>
//       <form onSubmit={(e) => submit(e, 'POST')}>
//         <Typography variant="h6" sx={{ mb: 2 }}>
//           Project
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid size={{ xs: 12, md: 8 }}>
//             <TextField
//               label="Title"
//               fullWidth
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//             />
//             <FormControlLabel
//               control={<Switch checked={visibility} onChange={handleToggle} color="primary" />}
//               label={visibility ? 'Visible' : 'Hidden'}
//             />
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <TextField
//               label="Role"
//               fullWidth
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//             />
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <TextField
//               label="Short description"
//               fullWidth
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <TextField
//               label="Long description"
//               fullWidth
//               multiline
//               minRows={3}
//               value={longDescription}
//               onChange={(e) => setLongDescription(e.target.value)}
//             />
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }}>
//             <TextField
//               label="Github link"
//               fullWidth
//               value={githubLink}
//               onChange={(e) => setGithubLink(e.target.value)}
//             />
//           </Grid>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <TextField
//               label="Live link"
//               fullWidth
//               value={liveLink}
//               onChange={(e) => setLiveLink(e.target.value)}
//             />
//           </Grid>

//           <Grid size={{ xs: 12, md: 4 }}>
//             <TextField
//               label="Duration"
//               fullWidth
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//             />
//           </Grid>
//           <Grid size={{ xs: 12, md: 4 }}>
//             <TextField
//               label="Team size"
//               fullWidth
//               value={teamSize}
//               onChange={(e) => setTeamSize(e.target.value)}
//             />
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
//               <TextField
//                 label="Add technology"
//                 value={techInput}
//                 onChange={(e) => setTechInput(e.target.value)}
//                 size="small"
//               />
//               <Button onClick={addTechnology} startIcon={<AddIcon />}>
//                 Add
//               </Button>
//             </Box>
//             <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//               {technologies.map((t, i) => (
//                 <Chip key={i} label={t} onDelete={() => removeTechnology(i)} />
//               ))}
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
//               <TextField
//                 label="Add feature"
//                 value={featureInput}
//                 onChange={(e) => setFeatureInput(e.target.value)}
//                 size="small"
//               />
//               <Button onClick={addFeature} startIcon={<AddIcon />}>
//                 Add
//               </Button>
//             </Box>
//             <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//               {features.map((f, i) => (
//                 <Chip key={i} label={f} onDelete={() => removeFeature(i)} />
//               ))}
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12, md: 6 }}>
//             <TextField
//               label="Challenges (comma separated or keep blank)"
//               fullWidth
//               value={challenges?.join(', ')}
//               onChange={(e) =>
//                 setChallenges(
//                   e.target.value
//                     .split(',')
//                     .map((s) => s.trim())
//                     .filter(Boolean)
//                 )
//               }
//             />
//           </Grid>
//           <Grid size={{ xs: 12, md: 6 }}>
//             <TextField
//               label="Solutions (comma separated)"
//               fullWidth
//               value={solutions?.join(', ')}
//               onChange={(e) =>
//                 setSolutions(
//                   e.target.value
//                     .split(',')
//                     .map((s) => s.trim())
//                     .filter(Boolean)
//                 )
//               }
//             />
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <Box>
//               <Typography variant="subtitle2">Project image</Typography>
//               {image && (
//                 <Box
//                   sx={{ maxWidth: 240, width: '100%', height: 180, position: 'relative', mb: 1 }}
//                 >
//                   <Image
//                     alt="project"
//                     src={image}
//                     fill
//                     style={{ objectFit: 'contain', display: 'block', borderRadius: 8 }}
//                   />
//                 </Box>
//               )}
//               <input type="file" accept="image/*" onChange={handleImageChange} />
//             </Box>
//           </Grid>

//           <Grid size={{ xs: 12 }}>
//             <Typography variant="h6">Sections</Typography>
//             {sections.map((sec, si) => (
//               <CollapsibleSection title={sec.heading} key={sec.id || si}>
//                 <Paper sx={{ p: 2, mb: 2 }} key={sec.id}>
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'center',
//                     }}
//                   >
//                     <TextField
//                       label="Heading"
//                       value={sec.heading}
//                       onChange={(e) => updateSection(si, { heading: e.target.value })}
//                     />
//                     <IconButton color="error" onClick={() => removeSection(si)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Box>

//                   <Box sx={{ mt: 1 }}>
//                     <Typography variant="subtitle2">Paragraphs</Typography>
//                     {sec.content.map((c: string, ci: number) => (
//                       <Box
//                         key={ci}
//                         sx={{
//                           display: 'flex',
//                           gap: 1,
//                           alignItems: 'center',
//                           mt: 1,
//                         }}
//                       >
//                         <TextField
//                           fullWidth
//                           multiline
//                           value={c}
//                           onChange={(e) => updateSectionContent(si, ci, e.target.value)}
//                         />
//                         <IconButton onClick={() => removeSectionParagraph(si, ci)}>
//                           <DeleteIcon />
//                         </IconButton>
//                       </Box>
//                     ))}
//                     <Button onClick={() => addSectionParagraph(si)} startIcon={<AddIcon />}>
//                       Add paragraph
//                     </Button>
//                   </Box>

//                   <Box sx={{ mt: 1 }}>
//                     <Typography variant="subtitle2">Section image</Typography>
//                     {/* {sec.image && <Image alt={sec.heading} src={sec.image} style={{ maxWidth: 200, display: "block" }} />} */}
//                     {sec.image && (
//                       <Box
//                         sx={{
//                           maxWidth: 200,
//                           width: '100%',
//                           height: 'auto',
//                           position: 'relative',
//                           mb: 1,
//                         }}
//                       >
//                         <Image
//                           alt={sec.heading}
//                           src={sec.image}
//                           fill
//                           style={{ objectFit: 'contain', display: 'block' }}
//                         />
//                       </Box>
//                     )}
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => handleSectionImageChange(e, si)}
//                     />
//                   </Box>

//                   <Box sx={{ mt: 2 }}>
//                     <Typography variant="subtitle2">Subsections</Typography>
//                     {sec.subSections?.map((sub: SubSection, subi: number) => (
//                       <CollapsibleSection title={`${subi + 1} ${sub.heading}`} key={sub.id || subi}>
//                         <Paper key={sub.id} sx={{ p: 2, mt: 1 }}>
//                           <Box
//                             sx={{
//                               display: 'flex',
//                               justifyContent: 'space-between',
//                               alignItems: 'center',
//                             }}
//                           >
//                             <TextField
//                               label="Sub heading"
//                               value={sub.heading}
//                               onChange={(e) =>
//                                 updateSubSection(si, subi, {
//                                   heading: e.target.value,
//                                 })
//                               }
//                             />
//                             <IconButton color="error" onClick={() => removeSubSection(si, subi)}>
//                               <DeleteIcon />
//                             </IconButton>
//                           </Box>

//                           <Box sx={{ mt: 1 }}>
//                             <Typography variant="subtitle2">Content</Typography>
//                             {sub.content?.map((pc: string, pci: number) => (
//                               <Box
//                                 key={pci}
//                                 sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}
//                               >
//                                 <TextField
//                                   fullWidth
//                                   multiline
//                                   value={pc}
//                                   onChange={(e) =>
//                                     updateSubSection(si, subi, {
//                                       content: sub.content?.map((x, idx) =>
//                                         idx === pci ? e.target.value : x
//                                       ),
//                                     })
//                                   }
//                                 />
//                                 <IconButton
//                                   onClick={() =>
//                                     updateSubSection(si, subi, {
//                                       content: sub.content?.filter((_, idx) => idx !== pci),
//                                     })
//                                   }
//                                 >
//                                   <DeleteIcon />
//                                 </IconButton>
//                                 <Button
//                                   onClick={() =>
//                                     updateSubSection(si, subi, {
//                                       content: [...(sub.content || []), ''],
//                                     })
//                                   }
//                                   startIcon={<AddIcon />}
//                                   sx={{ mt: 1 }}
//                                 >
//                                   Add paragraph
//                                 </Button>
//                               </Box>
//                             ))}
//                           </Box>

//                           <Box sx={{ mt: 1 }}>
//                             <Typography variant="subtitle2">Points</Typography>
//                             {sub.points?.map((p: string, pi: number) => (
//                               <Box
//                                 key={pi}
//                                 sx={{
//                                   display: 'flex',
//                                   gap: 1,
//                                   alignItems: 'center',
//                                   mt: 1,
//                                 }}
//                               >
//                                 <TextField
//                                   fullWidth
//                                   value={p}
//                                   onChange={(e) => updatePoint(si, subi, pi, e.target.value)}
//                                 />
//                                 <IconButton onClick={() => removePoint(si, subi, pi)}>
//                                   <DeleteIcon />
//                                 </IconButton>
//                               </Box>
//                             ))}
//                             <Button onClick={() => addPoint(si, subi, '')} startIcon={<AddIcon />}>
//                               Add point
//                             </Button>
//                           </Box>

//                           <Box sx={{ mt: 1 }}>
//                             <Typography variant="subtitle2">Equations</Typography>
//                             {sub.equation && (
//                               <div
//                                 style={{
//                                   background: '#f5f5f5',
//                                   padding: 15,
//                                   borderRadius: 6,
//                                   minHeight: 60,
//                                 }}
//                               >
//                                 {sub.equation ? (
//                                   <BlockMath math={sub.equation} />
//                                 ) : (
//                                   'Nothing to render'
//                                 )}
//                               </div>
//                             )}

//                             {/* {sub.image && <Image alt={sub.heading?? ""} src={sub.image} style={{ maxWidth: 200, display: "block" }} />} */}
//                             {/* <input
//                           type="file"
//                           accept="image/*"
//                           onChange={(e) => handleSubSectionImageChange(e, si, subi)}
//                         /> */}
//                             <textarea
//                               value={sub.equation}
//                               onChange={(e) => handleSubSectionEqationChange(e, si, subi)}
//                               placeholder="Type math like: \int_0^1 x^2 dx"
//                               style={{
//                                 width: '100%',
//                                 height: 80,
//                                 padding: 10,
//                                 borderRadius: 6,
//                                 border: '1px solid #ccc',
//                               }}
//                             />
//                           </Box>

//                           <Box sx={{ mt: 1 }}>
//                             <Typography variant="subtitle2">Subsection image</Typography>
//                             {sub.image && (
//                               <Box
//                                 sx={{
//                                   maxWidth: 200,
//                                   width: '100%',
//                                   height: 150,
//                                   position: 'relative',
//                                   mb: 1,
//                                 }}
//                               >
//                                 <Image
//                                   alt={sub.heading ?? ''}
//                                   src={sub.image}
//                                   fill
//                                   style={{ objectFit: 'contain', display: 'block' }}
//                                 />
//                               </Box>
//                             )}

//                             {/* {sub.image && <Image alt={sub.heading?? ""} src={sub.image} style={{ maxWidth: 200, display: "block" }} />} */}
//                             <input
//                               type="file"
//                               accept="image/*"
//                               onChange={(e) => handleSubSectionImageChange(e, si, subi)}
//                             />
//                           </Box>
//                         </Paper>
//                       </CollapsibleSection>
//                     ))}

//                     <Button
//                       onClick={() => addSubSection(si)}
//                       startIcon={<AddIcon />}
//                       sx={{ mt: 1 }}
//                     >
//                       Add subsection
//                     </Button>
//                   </Box>

//                   <Typography variant="subtitle2">Columns</Typography>

//                   {sec.columns?.map((col, ci) => (
//                     <Paper key={col.id} sx={{ p: 2, mt: 1 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <TextField
//                           label="Type"
//                           select
//                           value={col.type}
//                           onChange={(e) =>
//                             updateSection(si, {
//                               columns: sec.columns?.map((c, idx) =>
//                                 idx === ci ? { ...c, type: e.target.value as Column['type'] } : c
//                               ),
//                             })
//                           }
//                           SelectProps={{ native: true }}
//                           sx={{ width: 160 }}
//                         >
//                           <option value="text">Text</option>
//                           <option value="points">Points</option>
//                           <option value="image">Image</option>
//                           <option value="equation">Equation</option>
//                         </TextField>
//                         <TextField
//                           label="Width (%)"
//                           type="number"
//                           sx={{ width: 120, mt: 1 }}
//                           value={col.width ?? 0}
//                           onChange={(e) =>
//                             updateSection(si, {
//                               columns: sec.columns?.map((c, idx) =>
//                                 idx === ci ? { ...c, width: Number(e.target.value) } : c
//                               ),
//                             })
//                           }
//                         />

//                         <IconButton color="error" onClick={() => removeColumnFromSection(si, ci)}>
//                           <DeleteIcon />
//                         </IconButton>
//                       </Box>

//                       {/* TEXT */}
//                       {col.type === 'text' && (
//                         <TextField
//                           fullWidth
//                           multiline
//                           label="Text"
//                           value={col.content as string}
//                           sx={{ mt: 1 }}
//                           onChange={(e) =>
//                             updateSection(si, {
//                               columns: sec.columns?.map((c, idx) =>
//                                 idx === ci ? { ...c, content: e.target.value } : c
//                               ),
//                             })
//                           }
//                         />
//                       )}

//                       {/* EQUATION */}
//                       {col.type === 'equation' && (
//                         <TextField
//                           fullWidth
//                           multiline
//                           label="Equation"
//                           sx={{ mt: 1 }}
//                           value={col.content as string}
//                           onChange={(e) =>
//                             updateSection(si, {
//                               columns: sec.columns?.map((c, idx) =>
//                                 idx === ci ? { ...c, content: e.target.value } : c
//                               ),
//                             })
//                           }
//                         />
//                       )}

//                       {/* POINTS */}
//                       {col.type === 'points' && (
//                         <>
//                           {(Array.isArray(col.content) ? col.content : []).map((point, pi) => (
//                             <Box sx={{ display: 'flex', gap: 1, mt: 1 }} key={pi}>
//                               <TextField
//                                 fullWidth
//                                 value={point}
//                                 label={`Point ${pi + 1}`}
//                                 onChange={(e) =>
//                                   updateSection(si, {
//                                     columns: sec.columns?.map((c, idx) =>
//                                       idx === ci
//                                         ? {
//                                             ...c,
//                                             content: (c.content as string[]).map((p, j) =>
//                                               j === pi ? e.target.value : p
//                                             ),
//                                           }
//                                         : c
//                                     ),
//                                   })
//                                 }
//                               />

//                               <IconButton
//                                 onClick={() =>
//                                   updateSection(si, {
//                                     columns: sec.columns?.map((c, idx) =>
//                                       idx === ci
//                                         ? {
//                                             ...c,
//                                             content: (c.content as string[]).filter(
//                                               (_, j) => j !== pi
//                                             ),
//                                           }
//                                         : c
//                                     ),
//                                   })
//                                 }
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </Box>
//                           ))}

//                           <Button
//                             sx={{ mt: 1 }}
//                             startIcon={<AddIcon />}
//                             onClick={() =>
//                               updateSection(si, {
//                                 columns: sec.columns?.map((c, idx) =>
//                                   idx === ci
//                                     ? {
//                                         ...c,
//                                         content: [...((c.content as string[]) || []), ''],
//                                       }
//                                     : c
//                                 ),
//                               })
//                             }
//                           >
//                             Add point
//                           </Button>
//                         </>
//                       )}

//                       {/* IMAGE */}
//                       {col.type === 'image' && (
//                         <input
//                           type="file"
//                           accept="image/*"
//                           style={{ marginTop: 12 }}
//                           onChange={async (e) => {
//                             const file = e.target.files?.[0];
//                             if (!file) return;
//                             const dataUrl = await fileToDataUrl(file);
//                             updateSection(si, {
//                               columns: sec.columns?.map((c, idx) =>
//                                 idx === ci ? { ...c, content: dataUrl } : c
//                               ),
//                             });
//                           }}
//                         />
//                       )}
//                     </Paper>
//                   ))}

//                   <Button
//                     startIcon={<AddIcon />}
//                     sx={{ mt: 1 }}
//                     onClick={() => addColumnToSection(si)}
//                   >
//                     Add column
//                   </Button>
//                 </Paper>
//               </CollapsibleSection>
//             ))}

//             <Button onClick={addSection} startIcon={<AddIcon />}>
//               Add section
//             </Button>
//           </Grid>

//           <Grid size={{ xs: 12 }} sx={{ display: 'flex', gap: 1 }}>
//             {submitMethod === 'PUT' && (
//               <Button
//                 variant="contained"
//                 onClick={() => {
//                   submit(undefined, submitMethod, id);
//                 }}
//               >
//                 Update
//               </Button>
//             )}
//             {submitMethod === 'POST' && (
//               <Button
//                 variant="contained"
//                 onClick={() => {
//                   submit(undefined, submitMethod);
//                 }}
//               >
//                 {submitLabel}
//               </Button>
//             )}
//             {/* <Button variant="contained" type="submit">
//               {submitLabel}
//             </Button>
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 submit(undefined, submitMethod, id);
//               }}
//             >
//               Save
//             </Button> */}
//           </Grid>
//         </Grid>
//       </form>
//     </Paper>
//   );
// }


// components/ProjectForm.tsx
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Box, Button, FormControlLabel, Grid, Paper, Switch, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import type { ProjectDoc } from '@/app/models/projects';
import { Project, Section } from '../data/projectsData';
import { fileToDataUrl } from '../utils/fileHelpers';
import TagsInput from './TagsInput';
import SectionEditor from './SectionEditor';

type FormProps = {
  initial?: Partial<ProjectDoc>;
  onSaved?: (project: Project) => void;
  submitLabel?: string;
  submitMethod?: 'POST' | 'PUT';
};

export default function ProjectForm({
  initial = {},
  onSaved,
  submitLabel = 'Save Project',
  submitMethod = 'POST',
}: FormProps) {
  const [id] = useState<string>(typeof initial._id === 'string' ? initial._id : '');
  
  // Base State
  const [title, setTitle] = useState(initial.title ?? '');
  const [visibility, setVisibility] = useState(initial.visibility ?? false);
  const [description, setDescription] = useState(initial.description ?? '');
  const [longDescription, setLongDescription] = useState(initial.longDescription ?? '');
  const [githubLink, setGithubLink] = useState(initial.githubLink ?? '');
  const [liveLink, setLiveLink] = useState(initial.liveLink ?? '');
  const [duration, setDuration] = useState(initial.duration ?? '');
  const [teamSize, setTeamSize] = useState(initial.teamSize ?? '');
  const [role, setRole] = useState(initial.role ?? '');
  const [image, setImage] = useState<string | undefined>(initial.image);

  // Arrays handled by TagsInput
  const [technologies, setTechnologies] = useState<string[]>(initial.technologies ?? []);
  const [features, setFeatures] = useState<string[]>(initial.features ?? []);
  const [challenges, setChallenges] = useState<string[]>(initial.challenges ?? []);
  const [solutions, setSolutions] = useState<string[]>(initial.solutions ?? []);

  // Sections
  const [sections, setSections] = useState<Section[]>(initial.sections ?? []);

  useEffect(() => {
    setSections((s) => s.map((sec) => ({ ...sec, id: sec.id ?? uuidv4() })));
  }, []);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(await fileToDataUrl(file));
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload: Project = {
      visibility, title, description, longDescription, technologies,
      features, challenges, solutions, image, githubLink, liveLink,
      duration, teamSize, role, sections,
    };

    try {
      const res = submitMethod === 'POST' 
        ? await axios.post('/api/projects', payload)
        : await axios.put(`/api/projects/${id}`, payload);
      
      if (onSaved) onSaved(res.data);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save: ' + (err?.response?.data?.error || err?.message));
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
      <form onSubmit={submit}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          {submitMethod === 'POST' ? 'Add New Project' : 'Edit Project'}
        </Typography>

        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid size={{ xs: 12 , md :8}} >
            <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
            <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={visibility} onChange={(e) => setVisibility(e.target.checked)} color="success" />} label={visibility ? 'Publicly Visible' : 'Hidden Draft'} />
          </Grid>
          <Grid size={{ xs: 12 , md :4}}>
            <TextField label="Role" fullWidth value={role} onChange={(e) => setRole(e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12}}>
            <TextField label="Short description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12}}>
            <TextField label="Long description" fullWidth multiline minRows={4} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} />
          </Grid>

          {/* Links & Stats */}
          <Grid size={{ xs: 12, md :6}} ><TextField label="Github link" fullWidth value={githubLink} onChange={(e) => setGithubLink(e.target.value)} /></Grid>
          <Grid size={{ xs: 12, md :6}} ><TextField label="Live link" fullWidth value={liveLink} onChange={(e) => setLiveLink(e.target.value)} /></Grid>
          <Grid size={{ xs: 12, md :6}} ><TextField label="Duration" fullWidth value={duration} onChange={(e) => setDuration(e.target.value)} /></Grid>
          <Grid size={{ xs: 12, md :6}} ><TextField label="Team size" fullWidth value={teamSize} onChange={(e) => setTeamSize(e.target.value)} /></Grid>

          {/* Dynamic Tags */}
          <Grid size={{ xs: 12, md :6}} >
            <TagsInput label="Technologies" tags={technologies} onChange={setTechnologies} placeholder="e.g. Next.js, React" />
            <TagsInput label="Features" tags={features} onChange={setFeatures} />
          </Grid>
          <Grid size={{ xs: 12, md :6}} >
            <TagsInput label="Challenges" tags={challenges} onChange={setChallenges} />
            <TagsInput label="Solutions" tags={solutions} onChange={setSolutions} />
          </Grid>

          {/* Main Cover Image */}
          <Grid size={{ xs: 12}}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px dashed #ccc' }} elevation={0}>
              <Typography variant="subtitle1" gutterBottom>Project Cover Image</Typography>
              {image ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, height: 250, mb: 2 }}>
                  <Image alt="project cover" src={image} fill style={{ objectFit: 'cover', borderRadius: 8 }} />
                  <Button variant="contained" color="error" sx={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setImage(undefined)}>
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <input type="file" accept="image/*" onChange={handleMainImageChange} />
              )}
            </Paper>
          </Grid>

          {/* Sections Builder */}
          <Grid size={{ xs: 12}}>
            <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>Project Sections</Typography>
            {sections.map((sec, si) => (
              <SectionEditor 
                key={sec.id} 
                section={sec} 
                onChange={(updatedSec) => {
                  const newSecs = [...sections];
                  newSecs[si] = updatedSec;
                  setSections(newSecs);
                }}
                onRemove={() => setSections(sections.filter((_, i) => i !== si))}
              />
            ))}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={() => setSections([...sections, { id: uuidv4(), heading: 'New Section', content: [], subSections: [], columns: [] }])}
              sx={{ mt: 2 }}
            >
              Add New Section
            </Button>
          </Grid>

          {/* Submit Action */}
          <Grid size={{ xs: 12}} sx={{ mt: 4 }}>
            <Button variant="contained" color="success" size="large" type="submit" fullWidth sx={{ py: 1.5, fontSize: '1.1rem' }}>
              {submitLabel}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
